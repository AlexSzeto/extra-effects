// tests go here; this will not be compiled when this package is used as an extension.
let sfx = extraEffects.createFullPresetsSpreadEffectData(
    ExtraEffectPresetColor.Fire,
    ExtraEffectPresetShape.Twinkle
)

let calibrationCenter = sprites.create(img`
.
`, SpriteKind.Player)
let calibrationEffect = extraEffects.createCustomSpreadEffectData(
    [1], [2], new extraEffects.NumberRange(0, 0, 1.0, 1.0), new extraEffects.NumberRange(0, 0), new extraEffects.NumberRange(100, 100)
)

for(let shape=0; shape<4; shape++) {
    sfx = extraEffects.createFullPresetsSpreadEffectData(
        ExtraEffectPresetColor.Fire,
        shape
    )
    for(let diameter=1; diameter<=8; diameter++) {
        effects.clearParticles(calibrationCenter)
        extraEffects.createSpreadEffectOnAnchor(
            calibrationCenter,
            calibrationEffect,
            diameter * 12,
            1000,
            undefined
        )
        for (let i = 1; i < 2; i++) {
            let lifespan = i * 200
            info.setScore(lifespan)
            extraEffects.createSpreadEffectAt(
                scene.screenWidth() / 2,
                scene.screenHeight() / 2,
                sfx,
                diameter * 12,
                20,
                lifespan
            )
            pause(lifespan + 1000)
        }
    }
}
