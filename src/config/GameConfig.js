const GameConfig = {

    // Dimensões da arena de batalha
    arenaWidth: 1600,
    arenaHeight: 900,

    // Física
    gravity: 0,
    playerRadius: 35,

    // Combate
    attackRange: 80,
    knockbackForce: 55,
    projectileLifetime: 4000,

    // Barras de UI
    healthBarWidth: 400,
    healthBarHeight: 30,
    ultimateBarWidth: 400,
    ultimateBarHeight: 12,

    // Ultimate
    ultimateMaxCharge: 100,
    ultimateChargePerHit: 12,
    ultimateChargePerDamage: 4,

    // Combo
    comboWindow: 800,
    comboDamageMultiplier: 0.15,
    comboMaxStack: 10,

    // Parry
    parryWindow: 200,
    parryCooldown: 1500,
    parryStunDuration: 600,

    // Dash
    dashSpeed: 18,
    dashDuration: 150,
    dashCooldown: 900,
    dashInvincibleFrames: 100,

    // Rounds
    roundTime: 99,
    maxRounds: 3,

    // Efeitos visuais
    screenShakeIntensity: 8,
    screenShakeDuration: 200,
    hitStopDuration: 60,

    // Sons (chave para futura implementação)
    soundEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8

};

export default GameConfig;