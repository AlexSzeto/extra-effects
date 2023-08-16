// tests go here; this will not be compiled when this package is used as an extension.

info.changeScoreBy(2)

for (let i = 2; i < 50; i++) {
    effects.startExplosiveEffectAtPosition(
        effects.createFullPresetsEffectData(
            PresetColor.fire,
            PresetShape.cloud
        ),
        scene.screenWidth() / 2,
        scene.screenHeight() / 2,
        i * 200,
        50
    )

    pause(i * 200 + 1500)

    info.changeScoreBy(2)
}


// const sfx = effects.createSpreadEffectSource(
//     { x: 75, y: 55 },
//     1000,
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