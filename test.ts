// tests go here; this will not be compiled when this package is used as an extension.

let sfx
let calibrationCenter = sprites.create(image.create(1, 1), SpriteKind.Player)
let calibrationEffect = extraEffects.createCustomSpreadEffectData(
    [14], [1], new extraEffects.NumberRange(0, 0, 1.0, 1.0), new extraEffects.NumberRange(0, 0), new extraEffects.NumberRange(100, 100)
)

for (let color = 0; color < 6; color++) {
    for (let shape = 0; shape < 4; shape++) {
        sfx = extraEffects.createFullPresetsSpreadEffectData(
            color,
            shape
        )
        for (let diameter = 1; diameter <= 4; diameter++) {
            effects.clearParticles(calibrationCenter)
            extraEffects.createSpreadEffectOnAnchor(
                calibrationCenter,
                calibrationEffect,
                -1,
                diameter * 24,
                300,
            )
            for (let density = 0; density < 2; density++) {
                extraEffects.createSpreadEffectAt(
                    sfx,
                    scene.screenWidth() / 2,
                    scene.screenHeight() / 2,
                    200,
                    diameter * 24,
                    20 + density * 40,
                )
                pause(1400)
            }
        }
    }
}
effects.clearParticles(calibrationCenter)
