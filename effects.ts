namespace extraEffects {
    let cachedSin: Fx8[]
    let cachedCos: Fx8[]
    let cachedFourPixelCircle: Image
    let cachedSixPixelCircle: Image

    const NUM_SLICES = 90
    const MAX_LUT_SLICES = 20
    const MAX_TWEEN_SLICES = 20

    const fxOneHundred = Fx8(100)
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

    /**
     * Create a lookup table of values between two numbers
     * @param min 
     * @param max 
     * @returns 
     */
    function createNumberRangeLookupTable(min: number, max: number): Fx8[] {
        let table: Fx8[] = []
        for (let i = 0; i < MAX_LUT_SLICES; i++) {
            table.push(Fx8(min + (max - min) * i / MAX_LUT_SLICES))
        }
        return table
    }

    class SpreadParticleFactory extends particles.ParticleFactory {
        private sizeSlice: number
        private colorSlice: number
        private tweenOutSlice: number

        private spawnSpreadLookupTable: Fx8[]
        private lifespanSpreadLookupTable: Fx8[]
        private extraVX: Fx8
        private extraVY: Fx8
        private extraVelocityPercentageMultiplierLookupTable: Fx8[]

        /**
         * Creates a spread particle factory
         * @param colorLookupTable a lookup table of color index values used to color the particles over time
         * @param sizeLookupTable a lookup table of particle radius used to size the particles over time
         * @param minLifespan minimum randomized particle lifespan
         * @param maxLifespan maximum randomized particle lifespan
         * @param minSpawnSpread minimum randomized spawn distance away from center
         * @param maxSpawnSpread maximum randomized spawn distance away from center
         * @param minLifespanSpread minimum randomized distance traveled over the lifespan of the particle
         * @param maxLifespanSpread maximum randomized distance traveled over the lifespan of the particle
         * @param extraVX extra x velocity added to the particle on spawn
         * @param extraVY extra y velocity added to the particle on spawn
         * @param minExtraVelocityPercentageMultiplier minimum randomized percentage multiplier for the added velocity
         * @param maxExtraVelocityPercentageMultiplier maximum randomized percentage multiplier for the added velocity
         * @param tweenOutAfterLifespanPastPercentage lifespan percentage cutoff before the particle velocity tweens out 
         */
        constructor(
            private colorLookupTable: number[],
            private sizeLookupTable: number[],
            private minLifespan: number,
            private maxLifespan: number,
            minSpawnSpread: number,
            maxSpawnSpread: number,
            minLifespanSpread: number,
            maxLifespanSpread: number,
            extraVX: number,
            extraVY: number,
            minExtraVelocityPercentageMultiplier: number,
            maxExtraVelocityPercentageMultiplier: number,
            private tweenOutAfterLifespanPastPercentage: number,
        ) {
            super()
            initCache()
            this.colorLookupTable = this.colorLookupTable.slice()
            this.colorLookupTable.reverse()
            this.colorSlice = this.maxLifespan / this.colorLookupTable.length
            this.sizeLookupTable = this.sizeLookupTable.slice()
            this.sizeLookupTable.reverse()
            this.sizeSlice = this.maxLifespan / this.sizeLookupTable.length
            this.tweenOutSlice = this.maxLifespan / MAX_TWEEN_SLICES
            this.spawnSpreadLookupTable = createNumberRangeLookupTable(minSpawnSpread, maxSpawnSpread)
            this.lifespanSpreadLookupTable = createNumberRangeLookupTable(minLifespanSpread * 1000 / maxLifespan, maxLifespanSpread * 1000 / maxLifespan)
            this.extraVX = Fx8(extraVX)
            this.extraVY = Fx8(extraVY)
            this.extraVelocityPercentageMultiplierLookupTable = createNumberRangeLookupTable(minExtraVelocityPercentageMultiplier, maxExtraVelocityPercentageMultiplier)
            this.tweenOutAfterLifespanPastPercentage = 100 - tweenOutAfterLifespanPastPercentage
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p: particles.Particle = super.createParticle(anchor);

            p.lifespan = galois.randomRange(this.minLifespan, this.maxLifespan - 1)
            p.data = (this.tweenOutAfterLifespanPastPercentage * MAX_TWEEN_SLICES / 100) * this.tweenOutSlice

            const angle = galois.randomRange(0, NUM_SLICES - 1)
            const spawnSpreadMultiplier = galois.pickRandom(this.spawnSpreadLookupTable)
            const velocityMultiplier = galois.pickRandom(this.lifespanSpreadLookupTable)
            const extraVelocityMultiplier = Fx.div(galois.pickRandom(this.extraVelocityPercentageMultiplierLookupTable), fxOneHundred)

            p._x = Fx.add(p._x, Fx.mul(cachedCos[angle], spawnSpreadMultiplier))
            p._y = Fx.add(p._y, Fx.mul(cachedSin[angle], spawnSpreadMultiplier))
            p.vx = Fx.add(Fx.mul(cachedCos[angle], velocityMultiplier), Fx.mul(this.extraVX, extraVelocityMultiplier))
            p.vy = Fx.add(Fx.mul(cachedSin[angle], velocityMultiplier), Fx.mul(this.extraVY, extraVelocityMultiplier))            

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            const size = this.sizeLookupTable[Math.floor(p.lifespan / this.sizeSlice)]
            const radius = Fx.div(Fx8(size), Fx.twoFx8)

            const colorIndex = Math.floor(p.lifespan / this.colorSlice)
            const color = this.colorLookupTable[colorIndex]
            const darkerColor = colorIndex === 0 ? color : this.colorLookupTable[colorIndex - 1]

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
                    screen.fillCircle(Fx.toInt(x), Fx.toInt(y), Fx.toInt(radius), darkerColor)
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
     * Create a particle source on a center spread trajectory
     * @param anchor anchor for the center point of all spawned particles
     * @param totalLifespan lifespan of all particles including the lifespan of the last particle spawned
     * @param colorLookupTable a lookup table of color index values used to color the particles over time
     * @param sizeLookupTable a lookup table of particle radius used to size the particles over time
     * @param particlesPerSecond number of particles to generate per second
     * @param minParticleLifespan minimum randomized particle lifespan
     * @param maxParticleLifespan maximum randomized particle lifespan
     * @param minSpawnSpread minimum randomized spawn distance away from center
     * @param maxSpawnSpread maximum randomized spawn distance away from center
     * @param minLifespanSpread minimum randomized distance traveled over the lifespan of the particle
     * @param maxLifespanSpread maximum randomized distance traveled over the lifespan of the particle
     * @param extraVX extra x velocity added to the particle on spawn
     * @param extraVY extra y velocity added to the particle on spawn
     * @param minExtraVelocityPercentageMultiplier minimum randomized percentage multiplier for the added velocity
     * @param maxExtraVelocityPercentageMultiplier maximum randomized percentage multiplier for the added velocity
     * @param gravity y acceleration added to the velocity over time
     * @param tweenOutAfterLifespanPastPercentage lifespan percentage cutoff before the particle velocity tweens out
     * @returns 
     */
    export function createSpreadParticleSource(
        anchor: particles.ParticleAnchor,
        colorLookupTable: number[],
        sizeLookupTable: number[],
        particlesPerSecond: number,
        totalLifespan: number,
        minParticleLifespan: number = 200,
        maxParticleLifespan: number = 200,
        minSpawnSpread: number = 0,
        maxSpawnSpread: number = 0,
        minLifespanSpread: number = 0,
        maxLifespanSpread: number = 0,
        extraVX: number = 0,
        extraVY: number = 0,
        minExtraVelocityPercentageMultiplier: number = 100,
        maxExtraVelocityPercentageMultiplier: number = 100,
        gravity: number = 0,
        tweenOutAfterLifespanPastPercentage: number = 50,
    ): particles.ParticleSource {
        const factory = new SpreadParticleFactory(
            colorLookupTable,
            sizeLookupTable,
            minParticleLifespan,
            maxParticleLifespan,
            minSpawnSpread,
            maxSpawnSpread,
            minLifespanSpread,
            maxLifespanSpread,
            extraVX,
            extraVY,
            minExtraVelocityPercentageMultiplier,
            maxExtraVelocityPercentageMultiplier,
            tweenOutAfterLifespanPastPercentage,
        );

        let sourceLifespan = totalLifespan
        if (sourceLifespan >= 0) {
            sourceLifespan = Math.max(200, sourceLifespan - maxParticleLifespan)
            if (sourceLifespan < 1000) {
                particlesPerSecond *= 500 / sourceLifespan
            }
        }

        const src = new particles.ParticleSource(
            anchor,
            particlesPerSecond,
            factory
        )

        if (sourceLifespan >= 0) {
            src.lifespan = sourceLifespan
        }
        src.setAcceleration(0, gravity)
        return src
    }
}