enum ExtraEffectPresetColor {
    //% block="fire"
    Fire,
    //% block="ice"
    Ice,
    //% block="toxic"
    Toxic,
    //% block="electric"
    Electric,
    //% block="poison"
    Poison,
    //% block="smoke"
    Smoke,
}

enum ExtraEffectPresetShape {
    //% block="spark"
    Spark,
    //% block="explosion"
    Explosion,
    //% block="cloud"
    Cloud,
    //% block="twinkle"
    Twinkle,
}

/**
 * Provides extra effects based on particles spreading out of a center point
 */
//% color="#82047e" icon="\uf06d" block="Effects" advanced=true
//% groups="['Colors', 'Sizes', 'Data', 'Create']"
namespace extraEffects {

    const PRESET_COLOR_LUT = [
        [1, 5, 4, 2, 10, 10],
        [1, 1, 1, 9, 9, 6, 8],
        [5, 7, 7, 6, 6, 8],
        [1, 5, 4, 5, 1, 5, 1, 5, 1, 5, 4],
        [10, 10, 12],
        [1, 1, 13, 11]
    ]

    const PRESET_SIZE_LUT = [
        [6, 6, 4, 2, 1],
        [10, 16, 14, 12, 6, 4, 2, 1],
        [4, 16, 14, 12, 14, 16, 12, 8, 4],
        [1, 2, 4, 2, 2, 2, 1, 1, 1],
    ]

    export class NumberRange {
        constructor(
            public min: number,
            public max: number
        ) {
            if (min > max) {
                this.min = max
                this.max = min
            }
        }
    }

    /**
     * Factory function for creating a time based number range
     * @param min 
     * @param max 
     * @returns 
     */
    //% blockId="timeRangePicker"
    //% blockHidden=true
    //% block="between $min and $max ms"
    //% min.defl=200 max.defl=400
    //% min.shadow="timePicker" max.shadow="timePicker"
    export function __createTimeRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }

    /**
     * Factory fuction for creating a pixel based number range
     * @param min 
     * @param max 
     * @returns 
     */
    //% blockId="pixelRangePicker"
    //% blockHidden=true
    //% block="between $min and $max pixels away"
    //% min.min=0 min.max=50 min.defl=0
    //% max.min=0 max.max=50 max.defl=20
    export function __createPixelRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }
    
    /**
     * Factory function for creating a percentage based number range
     * @param min 
     * @param max 
     * @returns 
     */
    //% blockId="percentRangePicker"
    //% blockHidden=true
    //% block="between $min and $max \\%"
    //% min.min=0 min.max=100 min.defl=50
    //% max.min=0 max.max=100 max.defl=100
    export function __createPercentageRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }

    export class EffectData {
        constructor(
            public colorLookupTable: number[],
            public sizeLookupTable: number[],
            public spawnSpread: NumberRange,
            public lifespanSpread: NumberRange,
            public lifespan: NumberRange,
            public extraVX: number = 0,
            public extraVY: number = 0,
            public extraVelocityMultiplierPercentage: NumberRange = null,
            public tweenOutAfterLifespanPastPercentage: number = 50,
        ) { 
            if(!extraVelocityMultiplierPercentage) {
                this.extraVelocityMultiplierPercentage = new NumberRange(0, 0)
            }
        }
    }

    /**
     * Create a custom EffectData object by feeding it a full set of parameters
     * @param colorLookupTable a lookup table of color index values used to color the particles over time
     * @param sizeLookupTable a lookup table of particle radius used to size the particles over time
     * @param spawnSpread range of random spawn distance away from center
     * @param lifespanSpread range of random distance traveled over the particle lifespan
     * @param lifespan range of random particle lifespan
     * @param vx extra x velocity added on particle spawn
     * @param vy extra y velocity added on particle spawn
     * @param velocityPercentageMultiplier range of random percentage to scale the extra velocity
     * @param tweenOutLifespanBreakpoint applies velocity tween out after particle lifespan reaches break point
     * @returns 
     */
    //% group="Data"
    //% blockSetVariable=myEffect
    //% block="custom effect set|colors to $colorLookupTable sizes to $sizeLookupTable initial spread $spawnSpread over time spread $lifespanSpread duration $lifespan|| add initial velocity|vx $vx vy $vy multiplied $velocityPercentageMultiplier decelerate after duration $tweenOutLifespanBreakpoint"
    //% colorLookupTable.shadow="lists_create_with" colorLookupTable.defl="colorindexpicker"
    //% sizeLookupTable.shadow="presetSizeTablePicker"
    //% spawnSpread.shadow="pixelRangePicker"
    //% lifespanSpread.shadow="pixelRangePicker"
    //% lifespan.shadow="timeRangePicker"
    //% expandableArgumentMode="toggle"
    //% vx.min=-100 vx.max=100 vx.defl=0
    //% vy.min=-100 vy.max=100 vy.defl=0
    //% velocityPercentageMultiplier.shadow="percentRangePicker"
    //% tweenOutLifespanBreakpoint.shadow="timePicker" tweenOutLifespanBreakpoint.defl=200
    export function createCustomEffectData(
        colorLookupTable: number[],
        sizeLookupTable: number[],
        spawnSpread: NumberRange,
        lifespanSpread: NumberRange,
        lifespan?: NumberRange,
        vx: number = 0,
        vy: number = 0,
        velocityPercentageMultiplier: NumberRange = null,
        tweenOutLifespanBreakpoint: number = null,
    ): EffectData {
        return new EffectData(
            colorLookupTable,
            sizeLookupTable,
            spawnSpread,
            lifespanSpread,
            lifespan,
            vx,
            vy,
            !!velocityPercentageMultiplier
                ? velocityPercentageMultiplier
                : new NumberRange(100, 100),
            isNaN(tweenOutLifespanBreakpoint)
                ? 50
                : Math.floor(tweenOutLifespanBreakpoint / lifespan.max * 100)
        )
    }

    /**
     * Create an EffectData object using only preset values
     * @param color preset color table with a gradient of colors
     * @param shape preset shape value to change overall size and spread
     * @param diameter diameter of the effect area
     * @returns 
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createFullPresetsEffectData"
    //% block="preset effect $color $shape|| diameter $diameter"
    //% diameter.min=20 diameter.max=100 diameter.defl=50
    export function createFullPresetsEffectData(
        color: ExtraEffectPresetColor,
        shape: ExtraEffectPresetShape,
        diameter: number = 50,
    ): EffectData {
        return __createShapePresetEffectData(
            createPresetColorTable(color),
            shape,
            diameter,
        )
    }

    /**
     * Create an EffectData object with a single color and preset shape
     * @param color color index for all particles
     * @param shape preset shape value to change overall size and spread
     * @param diameter diameter of the effect area
     * @returns 
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createSingleColorEffectData"
    //% block="preset effect $color $shape|| diameter $diameter"
    //% color.shadow="colorindexpicker" color.defl=5
    //% diameter.min=20 diameter.max=100 diameter.defl=50
    export function createSingleColorEffectData(
        color: number,
        shape: ExtraEffectPresetShape,
        size: number = 50,
    ): EffectData  {
        return __createShapePresetEffectData(
            createSingleColorTable(color),
            shape,
            size,
        )
    }

    function __createShapePresetEffectData(
        colorLookupTable: number[],
        shape: ExtraEffectPresetShape,
        size: number = 50,
    ): EffectData {
        const radius = Math.floor(size / 2)
        const pmax = radius * 0.75
        switch (shape) {
            case ExtraEffectPresetShape.Spark:
                return new EffectData(
                    colorLookupTable,
                    PRESET_SIZE_LUT[shape],
                    new NumberRange(0, 0),
                    new NumberRange(12, Math.floor(radius * 1.5)),
                    new NumberRange(300, 400)
                )
            case ExtraEffectPresetShape.Explosion:
                return new EffectData(
                    colorLookupTable,
                    [10, Math.max(16, Math.floor(pmax)), Math.max(14, Math.floor(pmax * 0.5)), 12, 6, 4, 2, 1],
                    new NumberRange(0, Math.floor(radius * 0.50)),
                    new NumberRange(Math.floor(radius * 0.50), Math.floor(radius * 0.75)),
                    new NumberRange(400, 600)
                )
            case ExtraEffectPresetShape.Cloud:
                return new EffectData(
                    colorLookupTable,
                    [4, Math.max(16, Math.floor(pmax)), Math.max(14, Math.floor(pmax * 0.75)), Math.max(12, Math.floor(pmax * 0.5)), 14, 16, 12, 8, 4],
                    new NumberRange(0, Math.floor(radius * 0.50)),
                    new NumberRange(Math.floor(radius * 0.33), Math.floor(radius * 0.33)),
                    new NumberRange(800, 1200)
                )
            case ExtraEffectPresetShape.Twinkle:
                return new EffectData(
                    colorLookupTable,
                    PRESET_SIZE_LUT[shape],
                    new NumberRange(0, Math.floor(radius)),
                    new NumberRange(0, 0),
                    new NumberRange(300, 600)
                )
        }
    }

    /**
     * Create a spread effect at the screen coordinates
     * @param x center x of the effect
     * @param y center y of the effect
     * @param effectData data used to setup the effect particles
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect
     * @returns the anchor of the generated particle source
     */
    //% inlineInputMode=inline
    //% group="Create" color="#4b7bec"
    //% blockId="createSpreadEffectAt"
    //% blockSetVariable=myAnchor
    //% block="start $effectData at x $x y $y for $lifespan ms|| density $particlesPerSecond"
    //% effectData.shadow=variables_get effectData.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function createSpreadEffectAt(
        x: number,
        y: number,
        effectData: EffectData,
        particlesPerSecond: number = 20,
        lifespan?: number,
    ): particles.ParticleAnchor {
        const anchor = { x: x, y: y }
        createSpreadParticleSource(
            anchor,
            effectData.colorLookupTable,
            effectData.sizeLookupTable,
            particlesPerSecond,
            lifespan,
            effectData.lifespan.min,
            effectData.lifespan.max,
            effectData.spawnSpread.min,
            effectData.spawnSpread.max,
            effectData.lifespanSpread.min,
            effectData.lifespanSpread.max,
            effectData.extraVX,
            effectData.extraVY,
            effectData.extraVelocityMultiplierPercentage.min,
            effectData.extraVelocityMultiplierPercentage.max,
            effectData.tweenOutAfterLifespanPastPercentage,
        )
        return anchor
    }

    //% inlineInputMode=inline
    //% group="Create" color="#4b7bec"
    //% block="start $effectData at x $x y $y for $lifespan ms|| density $particlesPerSecond"
    //% blockAliasFor="extraEffects.createSpreadEffectAt"
    //% effectData.shadow=variables_get effectData.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function __createSpreadEffectAt(
        x: number,
        y: number,
        effectData: EffectData,
        particlesPerSecond: number = 20,
        lifespan?: number,
    ): void {
        const anchor = { x: x, y: y }
        createSpreadParticleSource(
            anchor,
            effectData.colorLookupTable,
            effectData.sizeLookupTable,
            particlesPerSecond,
            lifespan,
            effectData.lifespan.min,
            effectData.lifespan.max,
            effectData.spawnSpread.min,
            effectData.spawnSpread.max,
            effectData.lifespanSpread.min,
            effectData.lifespanSpread.max,
            effectData.extraVX,
            effectData.extraVY,
            effectData.extraVelocityMultiplierPercentage.min,
            effectData.extraVelocityMultiplierPercentage.max,
            effectData.tweenOutAfterLifespanPastPercentage,
        )
    }

    /**
     * Create a spread effect on a Sprite or other valid anchor objects
     * @param anchor a valid anchor object for the generated effect
     * @param effectData data used to setup the effect particles
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect
     */
    //% inlineInputMode=inline
    //% group="Create" color="#4b7bec"
    //% blockId="createSpreadEffectOnAnchor"
    //% block="$sprite start $effectData for $lifespan ms|| density $particlesPerSecond"
    //% sprite.shadow=variables_get sprite.defl=mySprite
    //% effectData.shadow=variables_get effectData.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function createSpreadEffectOnAnchor(
        anchor: particles.ParticleAnchor,
        effectData: EffectData,
        particlesPerSecond: number = 20,
        lifespan?: number,
    ): void {
        createSpreadParticleSource(
            anchor,
            effectData.colorLookupTable,
            effectData.sizeLookupTable,
            particlesPerSecond,
            lifespan,
            effectData.lifespan.min,
            effectData.lifespan.max,
            effectData.spawnSpread.min,
            effectData.spawnSpread.max,
            effectData.lifespanSpread.min,
            effectData.lifespanSpread.max,
            effectData.extraVX,
            effectData.extraVY,
            effectData.extraVelocityMultiplierPercentage.min,
            effectData.extraVelocityMultiplierPercentage.max,
            effectData.tweenOutAfterLifespanPastPercentage,
        )
    }

    /**
     * Create a color table based on a preset color set
     * @param color 
     * @returns 
     */
    //% group="Colors" color="#ff9008"
    //% blockId="presetColorTablePicker"
    //% block="array of $color colors"
    export function createPresetColorTable(color: ExtraEffectPresetColor): number[] {
        return PRESET_COLOR_LUT[color]
    }

    /**
     * Create a color table with a single color index
     * @param color
     * @returns 
     */
    //% group="Colors" color="#ff9008"
    //% blockId="singleColorTablePicker"
    //% block="array of only $color color"
    //% color.shadow="colorindexpicker" color.defl=5
    export function createSingleColorTable(color: number): number[] {
        return [color]
    }

    /**
     * Create the base particle sizes used by a preset shape
     * @param shape 
     * @returns 
     */
    //% group="Sizes" color="#ff9008"
    //% blockId="presetSizeTablePicker"
    //% block="sizes matching shape $shape"
    export function createPresetSizeTable(shape: ExtraEffectPresetShape): number[] {
        return PRESET_SIZE_LUT[shape]
    }

    /**
     * Create a number array that counts from the specified value down to 1
     * @param max 
     * @returns 
     */
    //% group="Sizes" color="#ff9008"
    //% blockId="shrinkingTablePicker"
    //% block="array of numbers shrinking from $max"
    //% max.min=1 max.max=100 max.defl=16
    export function createShrinkingSizeTable(max: number): number[] {
        const result = []
        for (let size = max; size > 0; size--) {
            result.push(size)
        }
        return result
    }

    /**
     * Create a number array that counts from 1 up to the specified value
     * @param max 
     * @returns 
     */
    //% group="Sizes" color="#ff9008"
    //% blockId="growingTablePicker"
    //% block="array of numbers growing to $max"
    //% max.min=1 max.max=100 max.defl=16
    export function createGrowingSizeTable(max: number): number[] {
        const result = []
        for (let size = 1; size <= max; size++) {
            result.push(size)
        }
        return result
    }
}