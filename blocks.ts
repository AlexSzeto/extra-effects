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
            public max: number,
            public minScale: number = 1.0,
            public maxScale: number = 1.0,
        ) {
            if (min > max) {
                this.min = max
                this.max = min
            }
        }

        resizedMin(size: number): number {
            return Math.max(this.min, this.minScale * size)            
        }

        resizedMax(size: number): number {
            return Math.max(this.max, this.maxScale * size)
        }
    }

    /**
     * Factory function for creating a time based number range
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
     */
    //% blockId="percentRangePicker"
    //% blockHidden=true
    //% block="between $min and $max \\%"
    //% min.min=0 min.max=100 min.defl=50
    //% max.min=0 max.max=100 max.defl=100
    export function __createPercentageRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }

    /**
     * A reusable group of settings used to create a specific style of spread effect. The size and duration of the effect can be adjusted as they are being created.
     */
    export class SpreadEffectData {
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
            public allowParticleResizing: boolean = false,
        ) { 
            if(!extraVelocityMultiplierPercentage) {
                this.extraVelocityMultiplierPercentage = new NumberRange(0, 0)
            }
        }
    }

    /**
     * Create a custom SpreadEffectData object from scratch. Read the description of each parameter or just play around with the settings to create a wide variety of unique effects.
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
    export function createCustomSpreadEffectData(
        colorLookupTable: number[],
        sizeLookupTable: number[],
        spawnSpread: NumberRange,
        lifespanSpread: NumberRange,
        lifespan?: NumberRange,
        vx: number = 0,
        vy: number = 0,
        velocityPercentageMultiplier: NumberRange = null,
        tweenOutLifespanBreakpoint: number = null,
    ): SpreadEffectData {
        return new SpreadEffectData(
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
     * Create a SpreadEffectData object using a combination of predefined settings
     * @param color preset color value that mimics various materials
     * @param shape preset shape value to change overall size and spread
     * @param diameter diameter of the effect area
     * @returns 
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createFullPresetsSpreadEffectData"
    //% block="preset effect $color $shape"
    export function createFullPresetsSpreadEffectData(
        color: ExtraEffectPresetColor,
        shape: ExtraEffectPresetShape,
    ): SpreadEffectData {
        return __createShapePresetSpreadEffectData(
            createPresetColorTable(color),
            shape,
        )
    }

    /**
     * Create a SpreadEffectData object with a predefined shape, but just a single color
     * @param color a color palette index used for all particles
     * @param shape preset shape value to change overall size and spread
     * @returns 
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createSingleColorSpreadEffectData"
    //% block="single color effect $color $shape"
    //% color.shadow="colorindexpicker" color.defl=5
    export function createSingleColorSpreadEffectData(
        color: number,
        shape: ExtraEffectPresetShape,
    ): SpreadEffectData  {
        return __createShapePresetSpreadEffectData(
            [color],
            shape,
        )
    }

    function __createShapePresetSpreadEffectData(
        colorLookupTable: number[],
        shape: ExtraEffectPresetShape,
    ): SpreadEffectData {
        const sizeLookupTable = PRESET_SIZE_LUT[shape]
        switch (shape) {
            case ExtraEffectPresetShape.Spark:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 0),
                    new NumberRange(12, 24, 0, 1.0),
                    new NumberRange(300, 400)
                )
            case ExtraEffectPresetShape.Explosion:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 24, 0, 0.5),
                    new NumberRange(12, 18, 0.5, 0.75),
                    new NumberRange(400, 600)
                )
            case ExtraEffectPresetShape.Cloud:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 24, 0, 0.66),
                    new NumberRange(16, 16, 0.33, 0.33),
                    new NumberRange(800, 1200)
                )
            case ExtraEffectPresetShape.Twinkle:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 0, 0, 1.0),
                    new NumberRange(0, 0),
                    new NumberRange(300, 600)
                )
        }
    }

    function resizeTable(table: number[], newMax: number): number[] {
        const tableMax = table.reduce((max, curr) => curr > max ? curr : max, 1)
        const rescaleFactor = newMax / tableMax
        return table.map(value => value >= 1 ? Math.max(1, Math.floor(value * rescaleFactor)) : 0)
    }

    /**
     * Create a spread effect at a set of coordinates. This is a fire and forget effect, so if the effect needs to be manipulated at any point, attach it to a Sprite instead.
     * @param x center x of the effect
     * @param y center y of the effect
     * @param effectData data used to setup the effect particles
     * @param diameter the maximum spread of the effect from edge to edge
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect
     */
    //% inlineInputMode=inline
    //% group="Create"
    //% block="start $effectData at x $x y $y|| with diameter $diameter|| density $particlesPerSecond|| for $lifespan ms"
    //% effectData.shadow=variables_get effectData.defl=myEffect
    //% diameter.min=20 diameter.max=100 diameter.defl=48
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function createSpreadEffectAt(
        x: number,
        y: number,
        effectData: SpreadEffectData,
        diameter: number = 48,
        particlesPerSecond: number = 20,
        lifespan?: number,
    ): void {
        createSpreadEffectOnAnchor(
            { x: x, y: y },
            effectData,
            diameter,
            particlesPerSecond,
            lifespan,
        )
    }

    /**
     * Create a spread effect on a Sprite or other valid anchor objects
     * @param anchor a valid anchor object for the generated effect
     * @param effectData data used to setup the effect particles
     * @param diameter the maximum spread of the effect from edge to edge
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect
     */
    //% inlineInputMode=inline
    //% group="Create"
    //% blockId="createSpreadEffectOnAnchor"
    //% block="$sprite start $effectData|| with diameter $diameter|| density $particlesPerSecond|| for $lifespan ms"
    //% sprite.shadow=variables_get sprite.defl=mySprite
    //% effectData.shadow=variables_get effectData.defl=myEffect
    //% diameter.min=20 diameter.max=100 diameter.defl=48
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function createSpreadEffectOnAnchor(
        anchor: particles.ParticleAnchor,
        effectData: SpreadEffectData,
        diameter: number = 48,
        particlesPerSecond: number = 20,
        lifespan?: number,
    ): void {
        createSpreadParticleSource(
            anchor,
            effectData.colorLookupTable,
            effectData.allowParticleResizing
                ? resizeTable(effectData.sizeLookupTable, Math.floor(diameter / 2))
                : effectData.sizeLookupTable,
            particlesPerSecond,
            lifespan,
            effectData.lifespan.resizedMin(diameter),
            effectData.lifespan.resizedMax(diameter),
            effectData.spawnSpread.resizedMin(diameter),
            effectData.spawnSpread.resizedMax(diameter),
            effectData.lifespanSpread.resizedMin(diameter),
            effectData.lifespanSpread.resizedMax(diameter),
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
     */
    //% group="Colors" color="#ff9008"
    //% blockId="presetColorTablePicker"
    //% block="array of $color colors"
    export function createPresetColorTable(color: ExtraEffectPresetColor): number[] {
        return PRESET_COLOR_LUT[color]
    }

    /**
     * Create the base particle sizes used by a preset shape
     * @param shape 
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