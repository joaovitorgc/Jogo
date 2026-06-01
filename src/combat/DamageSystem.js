import GameConfig from '../config/GameConfig.js';

export default class DamageSystem {

    constructor(scene) {
        this.scene = scene;
    }

    showDamage(x, y, amount) {

        if (this.scene.damageText) {
            this.scene.damageText.show(x, y, amount, amount >= 60);
        }

    }

    processProjectileHit(projectile, target, attacker) {

        if (!projectile.alive) return;

        let dmg = projectile.damage;

        // Multiplicador de combo se aplicável
        if (attacker.comboSystem) {
            dmg *= attacker.comboSystem.getMultiplier();
        }

        // Aplicar dano
        target.receberDano(dmg, attacker);

        // Efeitos especiais por elemento
        this._applyElementalEffect(projectile.element, target, attacker, dmg);

        // Destruir projétil
        projectile.destroy();

    }

    _applyElementalEffect(element, target, attacker, damageDealt) {

        switch (element) {

            case 'ice':
                // Reduz velocidade por 2s
                const origSpeed = target.speed;
                target.speed *= 0.6;
                this.scene.time.delayedCall(2000, () => {
                    if (target.isAlive) target.speed = origSpeed;
                });
                target.sprite.setTint(0x99ddff);
                this.scene.time.delayedCall(2000, () => {
                    if (target.sprite) target.sprite.clearTint();
                });
                break;

            case 'darkness':
                // Drena vida para o atacante
                const drain = damageDealt * 0.3;
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + drain);
                if (this.scene.damageText) {
                    this.scene.damageText.showHeal(attacker.sprite.x, attacker.sprite.y, drain);
                }
                break;

            case 'water':
                // Empurra fortemente na direção do projétil
                const dir = projectile?.velocityX > 0 ? 1 : -1;
                target.sprite.x += dir * 120;
                target._clampToBounds();
                break;

            case 'electric':
                // Stun curto
                target.aplicarStun(300);
                break;

            case 'fire':
                // Dano adicional ao longo do tempo (burn)
                let burnTicks = 3;
                const burnInterval = this.scene.time.addEvent({
                    delay: 600,
                    callback: () => {
                        if (target.isAlive) {
                            target.receberDano(6, attacker);
                        }
                        burnTicks--;
                        if (burnTicks <= 0) burnInterval.remove();
                    },
                    repeat: burnTicks
                });
                break;

            case 'wind':
                // Empurra para o ar (move para cima e depois cai)
                this.scene.tweens.add({
                    targets: [target.sprite, target.aura, target.ring, target.label],
                    y: target.sprite.y - 80,
                    duration: 200, yoyo: true,
                    ease: 'Cubic.easeOut'
                });
                break;

            case 'stone':
                // Derruba (stun curto + posição)
                target.aplicarStun(400);
                this.scene.cameras.main.shake(150, 0.01);
                break;

        }

    }

}