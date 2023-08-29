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
//% color="#82047e" icon="\uf06d" block="Effects"
//% groups="['Colors', 'Sizes', 'Data', 'Advanced Data', 'Create']"
namespace extraEffects {
    const PRESET_COLOR_LUT = [
        [1, 5, 4, 2, 14, 14],
        [1, 1, 1, 9, 9, 6, 8],
        [5, 7, 7, 6, 6, 8],
        [1, 5, 4, 5, 1, 5, 1, 5, 1, 5, 4],
        [10, 10, 12],
        [1, 1, 13, 11]
    ]

    const PRESET_SIZE_LUT = [
        [6, 6, 6, 4, 4, 2, 2, 1],
        [10, 16, 14, 12, 6, 4, 2, 1],
        [4, 16, 14, 12, 14, 16, 12, 8, 4],
        [1, 2, 4, 2, 2, 2, 1, 1, 1],
    ]

    export class NumberRange {
        constructor(
            public min: number,
            public max: number,
        ) {
            if (min > max) {
                this.min = max
                this.max = min
            }
        }

        resizedMin(size: number): number {
            return Math.max(1, this.min * size / 100)
        }

        resizedMax(size: number): number {
            return Math.max(1, this.max * size / 100)
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
    export function createTimeRange(min: number, max: number): NumberRange {
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
    export function createPercentageRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
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
    //% blockId="presetEffectPicker"
    //% block="effect $color $shape"
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
    //% block="effect $color $shape"
    //% color.shadow="colorindexpicker" color.defl=5
    export function createSingleColorSpreadEffectData(
        color: number,
        shape: ExtraEffectPresetShape,
    ): SpreadEffectData {
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
                    new NumberRange(0, 30),
                    new NumberRange(20, 100),
                    new NumberRange(300, 400),
                    0,
                    true
                )
            case ExtraEffectPresetShape.Explosion:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 40),
                    new NumberRange(50, 80),
                    new NumberRange(400, 600),
                    0.66
                )
            case ExtraEffectPresetShape.Cloud:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 50),
                    new NumberRange(33, 33),
                    new NumberRange(800, 1200),
                    0.75
                )
            case ExtraEffectPresetShape.Twinkle:
                return new SpreadEffectData(
                    colorLookupTable,
                    sizeLookupTable,
                    new NumberRange(0, 100),
                    new NumberRange(0, 0),
                    new NumberRange(300, 600)
                )
        }
    }

    function resizeTable(table: number[], newMax: number): number[] {
        const tableMax = table.reduce((max, curr) => curr > max ? curr : max, 1)
        const rescaleFactor = newMax / tableMax
        return rescaleFactor < 1
            ? table
            : table.map(value => value >= 1 ? Math.max(1, Math.floor(value * rescaleFactor)) : 0)
    }

    function circleArea(diameter: number): number {
        const radius = diameter / 2
        return Math.PI * radius * radius
    }

    /**
     * Create a spread effect at a set of coordinates. This is a fire and forget effect, so if the effect needs to be manipulated at any point, attach it to a Sprite instead.
     * @param x center x of the effect
     * @param y center y of the effect
     * @param effectData data used to setup the effect particles
     * @param diameter the maximum spread of the effect from edge to edge
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect, set to -1 for infinite duration
     */
    //% inlineInputMode=inline
    //% group="Create"
    //% block="start $effectData at x $x y $y for $lifespan ms|| with diameter $diameter density $particlesPerSecond"
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% effectData.shadow="createSingleColorSpreadEffectData"
    //% lifespan.shadow="timePicker" lifespan.defl=100
    //% diameter.min=20 diameter.max=100 diameter.defl=48
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    export function createSpreadEffectAt(
        effectData: SpreadEffectData,
        x: number,
        y: number,
        lifespan: number = 100,
        diameter: number = 48,
        particlesPerSecond: number = 20,
    ): void {
        createSpreadParticleSource(
            { x: x, y: y },
            effectData.colorLookupTable,
            !effectData.monoColor,
            resizeTable(effectData.sizeLookupTable, Math.floor(diameter / 2 * effectData.sizeScale)),
            diameter >= 50 ? Math.floor(particlesPerSecond * circleArea(Math.min(100, diameter)) / circleArea(50)) : particlesPerSecond,
            lifespan,
            effectData.lifespan.min,
            effectData.lifespan.max,
            effectData.spawnSpread.resizedMin(diameter / 2),
            effectData.spawnSpread.resizedMax(diameter / 2),
            effectData.lifespanSpread.resizedMin(diameter / 2),
            effectData.lifespanSpread.resizedMax(diameter / 2),
            effectData.extraVX,
            effectData.extraVY,
            effectData.extraVelocityMultiplierPercentage.min,
            effectData.extraVelocityMultiplierPercentage.max,
            effectData.gravity,
            effectData.sineShiftRadius,
            effectData.tweenOutAfterLifespanPastPercentage,
            effectData.z,
        )
    }

    /**
     * Create a spread effect on a Sprite
     * @param sprite a valid sprite object for the generated effect
     * @param effectData data used to setup the effect particles
     * @param diameter the maximum spread of the effect from edge to edge
     * @param particlesPerSecond frequency for generating particles
     * @param lifespan full duration of the effect, set to -1 for infinite duration
     */
    //% inlineInputMode=inline
    //% group="Create"
    //% blockId="createSpreadEffectOnAnchor"
    //% block="$sprite start $effectData for $lifespan ms|| with diameter $diameter density $particlesPerSecond"
    //% sprite.shadow=variables_get sprite.defl=mySprite
    //% effectData.shadow="createSingleColorSpreadEffectData"
    //% diameter.min=20 diameter.max=100 diameter.defl=48
    //% particlesPerSecond.min=10 particlesPerSecond.max=50 particlesPerSecond.defl=20
    //% lifespan.shadow="timePicker" lifespan.defl=100
    export function createSpreadEffectOnAnchor(
        sprite: Sprite,
        effectData: SpreadEffectData,
        lifespan: number = 100,
        diameter: number = 48,
        particlesPerSecond: number = 20,
    ): void {
        createSpreadParticleSource(
            sprite,
            effectData.colorLookupTable,
            !effectData.monoColor,
            resizeTable(effectData.sizeLookupTable, Math.floor(diameter / 2 * effectData.sizeScale)),
            diameter >= 50 ? Math.floor(particlesPerSecond * circleArea(Math.min(100, diameter)) / circleArea(50)) : particlesPerSecond,
            lifespan,
            effectData.lifespan.min,
            effectData.lifespan.max,
            effectData.spawnSpread.resizedMin(diameter / 2),
            effectData.spawnSpread.resizedMax(diameter / 2),
            effectData.lifespanSpread.resizedMin(diameter / 2),
            effectData.lifespanSpread.resizedMax(diameter / 2),
            effectData.extraVX,
            effectData.extraVY,
            effectData.extraVelocityMultiplierPercentage.min,
            effectData.extraVelocityMultiplierPercentage.max,
            effectData.gravity,
            effectData.sineShiftRadius,
            effectData.tweenOutAfterLifespanPastPercentage,
            effectData.z,
        )
    }

    /**
     * Create a custom SpreadEffectData object from scratch. Read the description of each parameter or just play around with the settings to create a wide variety of unique effects.
     * @param colorLookupTable a lookup table of color index values used to color the particles over time
     * @param monoColor define whether large particles should be one or two color
     * @param sizeLookupTable a lookup table of particle radius used to size the particles over time
     * @param spawnSpread range of random spawn distance away from center
     * @param lifespanSpread range of random distance traveled over the particle lifespan
     * @param lifespan range of random particle lifespan
     * @param vx extra x velocity added on particle spawn
     * @param vy extra y velocity added on particle spawn
     * @param velocityPercentageMultiplier range of random percentage to scale the extra velocity
     * @param gravity gravity applied to all particles over time
     * @param waveDiameter diameter of horizontal wave effect applied
     * @param tweenOutLifespanBreakpoint applies velocity tween out after particle lifespan reaches break point
     */
    //% group="Advanced Data" weight=100
    //% blockSetVariable=myEffect
    //% block="custom effect set|colors to $colorLookupTable mono particle color $monoColor sizes to $sizeLookupTable initial spread $spawnSpread over time spread $lifespanSpread duration $lifespan|| add initial velocity|vx $vx vy $vy multiplied $velocityPercentageMultiplier gravity $gravity wave diameter $waveDiameter decelerate after duration $tweenOutLifespanBreakpoint"
    //% colorLookupTable.shadow="lists_create_with" colorLookupTable.defl="colorindexpicker"
    //% monoColor.shadow="toggleYesNo" monoColor.defl=false
    //% sizeLookupTable.shadow="presetSizeTablePicker"
    //% spawnSpread.shadow="percentRangePicker"
    //% lifespanSpread.shadow="percentRangePicker"
    //% lifespan.shadow="timeRangePicker"
    //% expandableArgumentMode="toggle"
    //% vx.min=-100 vx.max=100 vx.defl=0
    //% vy.min=-100 vy.max=100 vy.defl=0
    //% velocityPercentageMultiplier.shadow="percentRangePicker"
    //% gravity.min=-100 gravity.max=100 gravity.defl=0
    //% waveDiameter.min=0 waveDiameter.max=20, waveDiameter.defl=0
    //% tweenOutLifespanBreakpoint.shadow="timePicker" tweenOutLifespanBreakpoint.defl=200
    export function createCustomSpreadEffectData(
        colorLookupTable: number[],
        monoColor: boolean,
        sizeLookupTable: number[],
        spawnSpread: NumberRange,
        lifespanSpread: NumberRange,
        lifespan?: NumberRange,
        vx: number = 0,
        vy: number = 0,
        velocityPercentageMultiplier: NumberRange = null,
        gravity: number = 0,
        waveDiameter: number = 0,
        tweenOutLifespanBreakpoint: number = null,
    ): SpreadEffectData {
        return new SpreadEffectData(
            colorLookupTable,
            sizeLookupTable,
            spawnSpread,
            lifespanSpread,
            lifespan,
            0,
            monoColor,
            vx,
            vy,
            !!velocityPercentageMultiplier
                ? velocityPercentageMultiplier
                : new NumberRange(100, 100),
            gravity,
            Math.floor(waveDiameter / 2),
            isNaN(tweenOutLifespanBreakpoint)
                ? 50
                : Math.floor(tweenOutLifespanBreakpoint / lifespan.max * 100)
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
    //% block="array of $shape sizes"
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

/**
 * A reusable group of settings used to create a specific style of spread effect. The size and duration of the effect can be adjusted as they are being created.
 */
//% blockNamespace=extraEffects
class SpreadEffectData {
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="extra spawn vx"
    public extraVX: number
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="extra spawn vy"
    public extraVY: number
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="gravity"
    public gravity: number
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="wave radius"
    public sineShiftRadius: number
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="z (depth)"
    public z: number

    constructor(
        public colorLookupTable: number[],        
        public sizeLookupTable: number[],
        public spawnSpread: extraEffects.NumberRange,
        public lifespanSpread: extraEffects.NumberRange,
        public lifespan: extraEffects.NumberRange,
        public sizeScale: number = 0,
        public monoColor: boolean = false,
        extraVX: number = 0,
        extraVY: number = 0,
        public extraVelocityMultiplierPercentage: extraEffects.NumberRange = null,
        gravity: number = 0,
        sineShiftRadius: number = 0,
        public tweenOutAfterLifespanPastPercentage: number = 50,
    ) {
        this.extraVX = extraVX
        this.extraVY = extraVY
        this.gravity = gravity
        this.sineShiftRadius = sineShiftRadius
        this.z = 0
        if (!extraVelocityMultiplierPercentage) {
            this.extraVelocityMultiplierPercentage = new extraEffects.NumberRange(100, 100)
        }
    }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min initial spread pct"
    set minSpawnSpread(value: number) { this.spawnSpread.min = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min initial spread pct"
    get minSpawnSpread(): number { return this.spawnSpread.min }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max initial spread pct"
    set maxSpawnSpread(value: number) { this.spawnSpread.max = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max initial spread pct"
    get maxSpawnSpread(): number { return this.spawnSpread.max }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min over time spread pct"
    set minLifespanSpread(value: number) { this.lifespanSpread.min = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min over time spread pct"
    get minLifespanSpread(): number { return this.lifespanSpread.min }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max over time spread pct"
    set maxLifespanSpread(value: number) { this.lifespanSpread.max = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max over time spread pct"
    get maxLifespanSpread(): number { return this.lifespanSpread.max }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min particle duration"
    set minParticleLifespan(value: number) { this.lifespan.min = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="min particle duration"
    get minParticleLifespan(): number { return this.lifespan.min }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max particle duration"
    set maxParticleLifespan(value: number) { this.lifespan.max = value }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="max particle duration"
    get maxParticleLifespan(): number { return this.lifespan.max }

    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="decelerate after duration"
    set decelerateAfterDuration(value: number) { this.tweenOutAfterLifespanPastPercentage = Math.floor(value / this.lifespan.max * 100) }
    //% group="Advanced Data" blockSetVariable="myEffect"
    //% blockCombine block="decelerate after duration"
    get decelerateAfterDuration(): number { return Math.floor(this.tweenOutAfterLifespanPastPercentage * this.lifespan.max / 100) }

    //% group="Advanced Data"
    //% block="set $this colors to $colorLookupTable"
    //% this.defl=myEffect
    //% colorLookupTable.shadow="lists_create_with" colorLookupTable.defl="colorindexpicker"
    public setSpreadEffectDataColorLookupTable(colorLookupTable: number[]): void {
        this.colorLookupTable = colorLookupTable
    }

    //% group="Advanced Data"
    //% block="set $this sizes to $sizeLookupTable"
    //% this.defl=myEffect
    public setSpreadEffectDataSizeLookupTable(sizeLookupTable: number[]): void {
        this.sizeLookupTable = sizeLookupTable
    }

    //% group="Advanced Data"
    //% block="set $this mono particle color $monoColor"
    //% this.defl=myEffect
    //% monoColor.shadow="toggleYesNo" monoColor.defl=false
    public setSpreadEffectDataMonoColor(monoColor: boolean): void {
        this.monoColor = monoColor
    }

}