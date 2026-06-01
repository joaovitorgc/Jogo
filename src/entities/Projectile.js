import Phaser from 'phaser';

export default class Projectile {

    constructor(scene, x, y, color, velocityX, owner) {

        this.scene = scene;
        this.owner = owner;
        this.velocityX = velocityX;
        this.damage = 15;
        this.element = 'neutral';
        this.alive = true;

        // Sprite principal
        this.sprite = scene.add.circle(x, y, 18, color, 1).setDepth(15);

        // Rastro do projétil
        this.trailTimer = scene.time.addEvent({
            delay: 40,
            callback: this._spawnTrail,
            callbackScope: this,
            loop: true
        });

        // Pulso animado
        scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.3, scaleY: 1.3,
            duration: 200,
            yoyo: true,
            repeat: -1
        });

        // Auto-destruir após lifetime
        scene.time.delayedCall(4000, () => {
            if (this.alive) this.destroy();
        });

        scene.projectiles.push(this);

    }

    _spawnTrail() {

        if (!this.alive || !this.sprite) return;

        const trail = this.scene.add.circle(
            this.sprite.x - this.velocityX * 0.5,
            this.sprite.y,
            this.sprite.radius * 0.7,
            this.sprite.fillColor,
            0.5
        ).setDepth(14);

        this.scene.tweens.add({
            targets: trail,
            alpha: 0, scaleX: 0.1, scaleY: 0.1,
            duration: 200,
            onComplete: () => trail.destroy()
        });

    }

    update() {

        if (!this.alive) return;

        this.sprite.x += this.velocityX;

        // Limites da tela
        if (
            this.sprite.x < -50 ||
            this.sprite.x > 1650
        ) {
            this.destroy();
        }

    }

    destroy() {

        if (!this.alive) return;
        this.alive = false;

        if (this.trailTimer) {
            this.trailTimer.remove();
        }

        // Efeito de impacto
        if (this.sprite && this.sprite.active) {
            const boom = this.scene.add.circle(
                this.sprite.x, this.sprite.y,
                this.sprite.radius * 1.5,
                this.sprite.fillColor, 0.8
            ).setDepth(16);

            this.scene.tweens.add({
                targets: boom, scaleX: 3, scaleY: 3, alpha: 0,
                duration: 250, onComplete: () => boom.destroy()
            });

            this.sprite.destroy();
            this.sprite = null;
        }

        // Remover da lista de projéteis
        if (this.scene.projectiles) {
            this.scene.projectiles = this.scene.projectiles.filter(p => p !== this);
        }

    }

}