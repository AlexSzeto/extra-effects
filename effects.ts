namespace effects {
    let cachedSin: Fx8[]
    let cachedCos: Fx8[]
    let cachedFourPixelCircle: Image
    let cachedSixPixelCircle: Image

    const NUM_SLICES = 90
    const MAX_LUT_SLICES = 20
    const MAX_TWEEN_SLICES = 20
    const TWEEN_OUT_BREAKPOINT = 10

    // const fxOneHundred = Fx8(100)
    const galois = new Math.FastRandom()

    function initCache() {
        if (!cachedSin) {
            cachedSin = particles.cacheSin(NUM_SLICES)
            cachedCos = particles.cacheCos(NUM_SLICES)
            cachedFourPixelCircle =
                img`
            . F F .
            F F F F
            F F F F
            . F F .
            `
            cachedSixPixelCircle =
                img`
            . . F F . .
            . F F F F .
            F F F F F F
            F F F F F F
            . F F F F .
            . . F F . .
            `
        }
    }

    function createNumberRangeLUT(min: number, max: number) {
        let table: Fx8[] = []
        for (let i = 0; i < MAX_LUT_SLICES; i++) {
            table.push(Fx8(min + (max - min) * i / MAX_LUT_SLICES))
        }
        return table
    }

    class CircularParticleFactory extends particles.ParticleFactory {
        private sizeSlice: number
        private colorSlice: number
        private tweenOutSlice: number

        private initSpreadLUT: Fx8[]
        private travelDistanceLUT: Fx8[]
        // private extraVx: Fx8
        // private extraVy: Fx8
        // private extraVPctMultiplierLUT: Fx8[]
        private smallerCirclesLUT: Image[]

        constructor(
            private colorLifespanLUT: number[],
            private sizeLifespanLUT: number[],
            private minLifespan: number,
            private maxLifespan: number,
            minInitSpread: number,
            maxInitSpread: number,
            minTravelDistance: number,
            maxTravelDistance: number,
            // extraVx: number,
            // extraVy: number,
            // minExtraVPctMultiplier: number,
            // maxExtraVPctMultiplier: number,
            // private enableDeceleration: boolean,
        ) {
            super()
            initCache()
            this.colorLifespanLUT = this.colorLifespanLUT.slice()
            this.colorLifespanLUT.reverse()
            this.sizeLifespanLUT = this.sizeLifespanLUT.slice()
            this.sizeLifespanLUT.reverse()
            this.sizeSlice = this.maxLifespan / this.sizeLifespanLUT.length
            this.colorSlice = this.maxLifespan / this.colorLifespanLUT.length
            this.tweenOutSlice = this.maxLifespan / MAX_TWEEN_SLICES
            this.initSpreadLUT = createNumberRangeLUT(minInitSpread, maxInitSpread)
            this.travelDistanceLUT = createNumberRangeLUT(minTravelDistance * 1000 / maxLifespan, maxTravelDistance * 1000 / maxLifespan)
            // this.extraVx = Fx8(extraVx)
            // this.extraVy = Fx8(extraVy)
            // this.extraVPctMultiplierLUT = createNumberRangeLUT(minExtraVPctMultiplier, maxExtraVPctMultiplier)
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p: particles.Particle = super.createParticle(anchor);

            p.lifespan = galois.randomRange(this.minLifespan, this.maxLifespan - 1)
            // p.data = this.enableDeceleration ? TWEEN_OUT_BREAKPOINT * this.tweenOutSlice : 0
            p.data = TWEEN_OUT_BREAKPOINT * this.tweenOutSlice

            const angle = galois.randomRange(0, NUM_SLICES - 1)
            const initSpreadMultiplier = galois.pickRandom(this.initSpreadLUT)
            const velocityMultiplier = galois.pickRandom(this.travelDistanceLUT)
            // const extraVelocityPctMultiplier = galois.pickRandom(this.extraVPctMultiplierLUT)

            p._x = Fx.add(p._x, Fx.mul(cachedCos[angle], initSpreadMultiplier))
            p._y = Fx.add(p._y, Fx.mul(cachedSin[angle], initSpreadMultiplier))
            p.vx = Fx.mul(cachedCos[angle], velocityMultiplier)
            p.vy = Fx.mul(cachedSin[angle], velocityMultiplier)
            // p.vx = Fx.add(Fx.mul(cachedCos[angle], velocityMultiplier), Fx.div(Fx.mul(this.extraVx, extraVelocityPctMultiplier), fxOneHundred))
            // p.vy = Fx.add(Fx.mul(cachedSin[angle], velocityMultiplier), Fx.div(Fx.mul(this.extraVy, extraVelocityPctMultiplier), fxOneHundred)) 

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            const size = this.sizeLifespanLUT[Math.floor(p.lifespan / this.sizeSlice)]
            const radius = Fx.div(Fx8(size), Fx.twoFx8)

            const colorIndex = Math.floor(p.lifespan / this.colorSlice)
            const color = this.colorLifespanLUT[colorIndex]
            const coolerColor = colorIndex === 0 ? color : this.colorLifespanLUT[colorIndex - 1]
            switch (size) {
                case 0:
                    break
                case 1:
                    screen.setPixel(Fx.toInt(x), Fx.toInt(y), color)
                    break
                case 2:
                    screen.drawRect(Fx.toInt(x), Fx.toInt(y), 2, 2, color)
                    break
                case 3:
                case 4:
                    const fourPixelImage = cachedFourPixelCircle.clone()
                    fourPixelImage.replace(0xF, color)
                    screen.drawTransparentImage(fourPixelImage, Fx.toInt(Fx.sub(x, Fx.oneFx8)), Fx.toInt(Fx.sub(y, Fx.oneFx8)))
                    break
                case 5:
                case 6:
                    const sixPixelImage = cachedSixPixelCircle.clone()
                    sixPixelImage.replace(0xF, color)
                    screen.drawTransparentImage(sixPixelImage, Fx.toInt(Fx.sub(x, Fx.twoFx8)), Fx.toInt(Fx.sub(y, Fx.twoFx8)))
                    break
                case 7:
                case 8:
                case 9:
                case 10:
                    screen.fillCircle(Fx.toInt(x), Fx.toInt(y), Fx.toInt(radius), color)
                    break
                default:
                    screen.fillCircle(Fx.toInt(x), Fx.toInt(y), Fx.toInt(radius), coolerColor)
                    screen.fillCircle(Fx.toInt(x), Fx.toInt(y), Fx.toInt(Fx.sub(radius, Fx.twoFx8)), color)
                    break
            }

            while (p.lifespan < p.data) {
                p.data -= this.tweenOutSlice
                p.vx = Fx.div(Fx.mul(p.vx, Fx8(90)), Fx8(100))
                p.vy = Fx.div(Fx.mul(p.vy, Fx8(90)), Fx8(100))
            }
        }
    }

    /**
     * Create a particle source for circular particles on a center spread trajectory
     */
    export function createCircularEffect(
        anchor: particles.ParticleAnchor,
        lifespan: number,
        colorLUT: number[],
        sizeLUT: number[],
        frequency: number,
        minPLifespan: number,
        maxPLifespan: number,
        minSpread: number,
        maxSpread: number,
        minTravel: number,
        maxTravel: number,
        // extraVx: number = 0,
        // extraVy: number = 0,
        // minExtraVPctMultiplier: number = 100,
        // maxExtraVPctMultiplier: number = 100,
        // enableDeceleration: boolean = true,
    ): particles.ParticleSource {
        const factory = new CircularParticleFactory(
            colorLUT,
            sizeLUT,
            minPLifespan,
            maxPLifespan,
            minSpread,
            maxSpread,
            minTravel,
            maxTravel,
            // extraVx,
            // extraVy,
            // minExtraVPctMultiplier,
            // maxExtraVPctMultiplier,
            // enableDeceleration,
        );

        const src = new particles.ParticleSource(
            anchor,
            frequency,
            factory
        )

        src.lifespan = Math.max(50, lifespan - maxPLifespan)
        return src
    }
}