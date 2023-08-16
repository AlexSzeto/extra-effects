// tests go here; this will not be compiled when this package is used as an extension.
effects.startExplosiveEffectAtPosition(
    effects.createPresetColorEffectData(
        PresetColor.fire,
        PresetShape.twinkle
    ),
    scene.screenWidth() / 2,
    scene.screenHeight() / 2,
    10000,
    20,
)