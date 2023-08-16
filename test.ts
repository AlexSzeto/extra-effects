// tests go here; this will not be compiled when this package is used as an extension.

effects.startExplosiveEffectAtPosition(
    effects.createFullPresetsEffectData(
        PresetColor.fire,
        PresetShape.cloud
    ),
    scene.screenWidth() / 2,
    scene.screenHeight() / 2,
    100,
    20,
)

// const sfx = effects.createSpreadEffectSource(
//     { x: 75, y: 55 },
//     12000,
//     [4],
//     [2],
//     50,
//     300,
//     300,
//     0,
//     24,
//     0,
//     0,
//     24,
//     24,
//     100,
//     100,
//     50,
// )