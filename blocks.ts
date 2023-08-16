enum PresetColor {
    fire,
    ice,
    toxic,
    electric,
    poison,
    smoke,
}

enum PresetShape {
    spark,
    explosion,
    cloud,
    twinkle,
}

/**
 * Provides a few extra effects based on particles exploding out of a center point
 */
//% color=0x82047e icon="\uf06d" advanced=true
//% groups="['Colors', 'Sizes', 'Data', 'Create']"
namespace effects {

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
     * Create a range of time to randomly pick from
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
     * Create a range of pixels to randomly pick from
     */
    //% blockId="pixelRangePicker"
    //% blockHidden=true
    //% block="between $min and $max px away"
    //% min.min=0 min.max=50 min.defl=0
    //% max.min=0 max.max=50 max.defl=20
    export function __createPixelRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }

    /**
     * Create a range of percentages to randomly pick from
     */
    //% blockId="pctRangePicker"
    //% blockHidden=true
    //% block="between $min and $max \\%"
    //% min.min=0 min.max=100 min.defl=50
    //% max.min=0 max.max=100 max.defl=100
    export function __createPercentageRange(min: number, max: number): NumberRange {
        return new NumberRange(min, max)
    }

    export class EffectData {
        constructor(
            public colorLUT: number[],
            public sizeLUT: number[],
            public spawn: NumberRange,
            public spread: NumberRange,
            public duration: NumberRange,
            public evx: number = 0,
            public evy: number = 0,
            public evMultiplyPct: NumberRange = null,
            public deceleratePct: number = 50,
        ) { 
            if(!evMultiplyPct) {
                this.evMultiplyPct = new NumberRange(0, 0)
            }
        }
    }

    /**
     * Create custom effect data
     */
    //% group="Data"
    //% blockSetVariable=myEffect
    //% block="custom effect set|colors to $colorLUT sizes to $sizeLUT initial spread $spawn over time spread $spread duration $duration|| add initial velocity|vx $vx vy $vy multiplied $velocityPct decelerate after duration $decelerateDuration"
    //% colorLUT.shadow="lists_create_with" colorLUT.defl="colorindexpicker"
    //% sizeLUT.shadow="presetSizeTablePicker"
    //% spawn.shadow="pixelRangePicker"
    //% spread.shadow="pixelRangePicker"
    //% duration.shadow="timeRangePicker"
    //% expandableArgumentMode="toggle"
    //% vx.min=-100 vx.max=100 vx.defl=0
    //% vy.min=-100 vy.max=100 vy.defl=0
    //% velocityPct.shadow="pctRangePicker"
    //% decelerateDuration.shadow="timePicker" decelerateDuration.defl=200
    export function createCustomEffectData(
        colorLUT: number[],
        sizeLUT: number[],
        spawn: NumberRange,
        spread: NumberRange,
        duration: NumberRange,
        vx: number = 0,
        vy: number = 0,
        velocityPct: NumberRange = null,
        decelerateDuration: number = null,
    ): EffectData {
        return new EffectData(
            colorLUT,
            sizeLUT,
            spawn,
            spread,
            duration,
            vx,
            vy,
            !!velocityPct
                ? velocityPct
                : new NumberRange(0, 0),
            isNaN(decelerateDuration)
                ? 50
                : Math.floor(decelerateDuration / duration.max * 100)
        )
    }

    /**
     * Create effect using preset colors and shapes
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createFullPresetsEffectData"
    //% block="preset effect $color $shape|| $size px wide"
    //% size.min=20 size.max=100 size.defl=50
    export function createFullPresetsEffectData(
        color: PresetColor,
        shape: PresetShape,
        size: number = 50,
    ): EffectData {
        return __createPresetEffectData(
            createPresetColorTable(color),
            shape,
            size,
        )
    }

    /**
     * Create effect using a single color and preset shapes
     */
    //% group="Data"
    //% inlineInputMode=inline
    //% blockId="createSingleColorEffectData"
    //% block="preset effect $color $shape|| $size px wide"
    //% color.shadow="colorindexpicker" color.defl=5
    //% size.min=20 size.max=100 size.defl=50
    export function createSingleColorEffectData(
        color: number,
        shape: PresetShape,
        size: number = 50,
    ): EffectData  {
        return __createPresetEffectData(
            createSingleColorTable(color),
            shape,
            size,
        )
    }

    function __createPresetEffectData(
        colorLUT: number[],
        shape: PresetShape,
        size: number = 50,
    ): EffectData {
        const radius = Math.floor(size / 2)
        const pmax = radius * 0.75
        switch (shape) {
            case PresetShape.spark:
                return new EffectData(
                    colorLUT,
                    PRESET_SIZE_LUT[shape],
                    new NumberRange(0, 0),
                    new NumberRange(12, Math.floor(radius * 1.5)),
                    new NumberRange(300, 400)
                )
            case PresetShape.explosion:
                return new EffectData(
                    colorLUT,
                    [10, Math.max(16, Math.floor(pmax)), Math.max(14, Math.floor(pmax * 0.5)), 12, 6, 4, 2, 1],
                    new NumberRange(0, Math.floor(radius * 0.50)),
                    new NumberRange(Math.floor(radius * 0.50), Math.floor(radius * 0.75)),
                    new NumberRange(400, 600)
                )
            case PresetShape.cloud:
                return new EffectData(
                    colorLUT,
                    [4, Math.max(16, Math.floor(pmax)), Math.max(14, Math.floor(pmax * 0.75)), Math.max(12, Math.floor(pmax * 0.5)), 14, 16, 12, 8, 4],
                    new NumberRange(0, Math.floor(radius * 0.50)),
                    new NumberRange(Math.floor(radius * 0.33), Math.floor(radius * 0.33)),
                    new NumberRange(800, 1200)
                )
            case PresetShape.twinkle:
                return new EffectData(
                    colorLUT,
                    PRESET_SIZE_LUT[shape],
                    new NumberRange(0, Math.floor(radius)),
                    new NumberRange(0, 0),
                    new NumberRange(300, 600)
                )
        }
    }

    /**
     * Start an explosive effect at a position on the stage
     */
    //% inlineInputMode=inline
    //% group="Create" color=0x4b7bec
    //% blockId="createExplosiveEffectAtPosition"
    //% blockSetVariable=myAnchor
    //% block="start $effect at x $x y $y for $duration ms|| density $density"
    //% effect.shadow=variables_get effect.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% duration.shadow="timePicker" duration.defl=100
    //% density.min=10 density.max=50 density.defl=20
    export function startExplosiveEffectAtPosition(
        effect: EffectData,
        x: number,
        y: number,
        duration: number,
        density: number = 20,
    ): particles.ParticleAnchor {
        const anchor = { x: x, y: y }
        createSpreadEffectSource(
            anchor,
            duration,
            effect.colorLUT,
            effect.sizeLUT,
            density,
            effect.duration.min,
            effect.duration.max,
            effect.spawn.min,
            effect.spawn.max,
            effect.spread.min,
            effect.spread.max,
            effect.evx,
            effect.evy,
            effect.evMultiplyPct.min,
            effect.evMultiplyPct.max,
            effect.deceleratePct,
        )
        return anchor
    }

    //% inlineInputMode=inline
    //% group="Create" color=0x4b7bec
    //% block="start $effect at x $x y $y for $duration ms|| density $density"
    //% blockAliasFor="effects.createExplosiveEffectAtPosition"
    //% effect.shadow=variables_get effect.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% duration.shadow="timePicker" duration.defl=100
    //% density.min=10 density.max=50 density.defl=20
    export function __startExplosiveEffectAtPosition(
        effect: EffectData,
        x: number,
        y: number,
        duration: number,
        density: number = 20,
    ): void {
        const anchor = { x: x, y: y }
        createSpreadEffectSource(
            anchor,
            duration,
            effect.colorLUT,
            effect.sizeLUT,
            density,
            effect.duration.min,
            effect.duration.max,
            effect.spawn.min,
            effect.spawn.max,
            effect.spread.min,
            effect.spread.max,
            effect.evx,
            effect.evy,
            effect.evMultiplyPct.min,
            effect.evMultiplyPct.max,
            effect.deceleratePct,
        )
    }

    /**
     * Start an explosive effect on a sprite
     */
    //% inlineInputMode=inline
    //% group="Create" color=0x4b7bec
    //% blockId="createExplosiveEffectOnSprite"
    //% block="$sprite start $effect for $duration ms|| density $density"
    //% sprite.shadow=variables_get sprite.defl=mySprite
    //% effect.shadow=variables_get effect.defl=myEffect
    //% x.shadow="positionPicker" x.defl=75
    //% y.shadow="positionPicker" y.defl=55
    //% duration.shadow="timePicker" duration.defl=100
    //% density.min=10 density.max=50 density.defl=20
    export function startExplosiveEffectOnSprite(
        sprite: Sprite,
        effect: EffectData,
        duration: number,
        density: number = 20,
    ): void {
        createSpreadEffectSource(
            sprite,
            duration,
            effect.colorLUT,
            effect.sizeLUT,
            density,
            effect.duration.min,
            effect.duration.max,
            effect.spawn.min,
            effect.spawn.max,
            effect.spread.min,
            effect.spread.max,
            effect.evx,
            effect.evy,
            effect.evMultiplyPct.min,
            effect.evMultiplyPct.max,
            effect.deceleratePct,
        )
    }

    /**
     * Create preset color table
     */
    //% group="Colors" color=0xff9008
    //% blockId="presetColorTablePicker"
    //% block="array of $color colors"
    export function createPresetColorTable(color: PresetColor): number[] {
        return PRESET_COLOR_LUT[color]
    }

    /**
     * Create single color table
     */
    //% group="Colors" color=0xff9008
    //% blockId="singleColorTablePicker"
    //% block="array of only $color color"
    //% color.shadow="colorindexpicker" color.defl=5
    export function createSingleColorTable(color: number): number[] {
        return [color]
    }

    /**
     * Create preset table of sizes based on expected effect shape
     */
    //% group="Sizes" color=0xff9008
    //% blockId="presetSizeTablePicker"
    //% block="sizes matching shape $shape"
    export function createPresetSizeTable(shape: PresetShape): number[] {
        return PRESET_SIZE_LUT[shape]
    }

    /**
     * Create a set of numbers that shrinks
     */
    //% group="Sizes" color=0xff9008
    //% blockId="shrinkingTablePicker"
    //% block="array of numbers shrinking from $max"
    //% max.min=1 max.max=100 max.defl=16
    export function createShrinkingSizes(max: number): number[] {
        const result = []
        for (let size = max; size > 0; size--) {
            result.push(size)
        }
        return result
    }

    /**
     * Create a set of numbers that grows
     */
    //% group="Sizes" color=0xff9008
    //% blockId="growingTablePicker"
    //% block="array of numbers growing to $max"
    //% max.min=1 max.max=100 max.defl=16
    export function createGrowingSizes(max: number): number[] {
        const result = []
        for (let size = 1; size <= max; size++) {
            result.push(size)
        }
        return result
    }
}