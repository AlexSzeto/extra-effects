// tests go here; this will not be compiled when this package is used as an extension.
let sfx = extraEffects.createFullPresetsEffectData(
    ExtraEffectPresetColor.Fire,
    ExtraEffectPresetShape.Explosion
)

for (let i = 1; i < 10; i++) {
    let lifespan = i * 200
    info.setScore(lifespan)
    extraEffects.createSpreadEffectAt(
        scene.screenWidth() / 2,
        scene.screenHeight() / 2,
        sfx,
        20,
        lifespan
    )    
    pause(lifespan + 1000)
}
