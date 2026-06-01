import GameConfig from '../config/GameConfig.js';

export default class ParrySystem {

    constructor(scene, player) {

        this.scene = scene;
        this.player = player;
        this.lastParry = 0;

    }

    canParry() {

        return Date.now() - this.lastParry >= GameConfig.parryCooldown;

    }

    startParry() {

        if (!this.canParry()) return false;

        this.lastParry = Date.now();
        this.player.isParrying = true;

        // Visual do escudo de parry
        this.player.parryShield.setFillStyle(0xffffff, 0.35);
        this.player.parryShield.setStrokeStyle(4, 0xffffff, 1);

        // Efeito de ativação
        const glow = this.scene.add.circle(
            this.player.sprite.x, this.player.sprite.y,
            55, 0xffffff, 0.5
        ).setDepth(30);

        this.scene.tweens.add({
            targets: glow, scaleX: 1.5, scaleY: 1.5, alpha: 0,
            duration: 200, onComplete: () => glow.destroy()
        });

        // Encerrar parry após janela
        this.scene.time.delayedCall(GameConfig.parryWindow, () => {
            this._endParry();
        });

        return true;

    }

    _endParry() {

        this.player.isParrying = false;
        this.player.parryShield.setFillStyle(0xffffff, 0);
        this.player.parryShield.setStrokeStyle(0, 0, 0);

    }

    onSuccessfulParry(attacker) {

        this._endParry();

        // Flash dourado de parry perfeito
        const flash = this.scene.add.circle(
            this.player.sprite.x, this.player.sprite.y,
            70, 0xffd700, 0.9
        ).setDepth(40);

        this.scene.tweens.add({
            targets: flash, scaleX: 3, scaleY: 3, alpha: 0,
            duration: 400, ease: 'Expo.easeOut',
            onComplete: () => flash.destroy()
        });

        // Texto de parry
        const txt = this.scene.add.text(
            this.player.sprite.x, this.player.sprite.y - 80,
            'PARRY!',
            {
                fontSize: '28px', fontFamily: 'Arial Black',
                color: '#ffd700', stroke: '#000', strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(45);

        this.scene.tweens.add({
            targets: txt, y: txt.y - 50, alpha: 0,
            duration: 1000, ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });

        // Stunnar o atacante
        if (attacker) {
            attacker.aplicarStun(GameConfig.parryStunDuration);
        }

        this.scene.cameras.main.shake(100, 0.007);

    }

}