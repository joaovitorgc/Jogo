import GameConfig from '../config/GameConfig.js';

export default class DashSystem {

    constructor(scene, player) {

        this.scene = scene;
        this.player = player;
        this.lastDash = 0;

    }

    canDash() {

        return (
            Date.now() - this.lastDash >= GameConfig.dashCooldown &&
            !this.player.isDashing
        );

    }

    executeDash(dirX, dirY) {

        if (!this.canDash()) return false;

        this.lastDash = Date.now();
        this.player.isDashing = true;
        this.player.isInvincible = true;
        this.player.dashTimer = GameConfig.dashDuration;

        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        this.player.dashVx = (dirX / len) * GameConfig.dashSpeed;
        this.player.dashVy = (dirY / len) * GameConfig.dashSpeed;

        // Rastro visual de dash
        this._spawnDashTrail();

        // Remover invencibilidade após frames
        this.scene.time.delayedCall(GameConfig.dashInvincibleFrames, () => {
            if (this.player) this.player.isInvincible = false;
        });

        return true;

    }

    _spawnDashTrail() {

        const player = this.player;
        const color = player.data.cor;

        // 5 fantasmas no rastro
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 20, () => {
                const ghost = this.scene.add.circle(
                    player.sprite.x, player.sprite.y,
                    32, color, 0.5 - i * 0.08
                ).setDepth(8);

                this.scene.tweens.add({
                    targets: ghost,
                    alpha: 0, scaleX: 0.2, scaleY: 0.2,
                    duration: 200 + i * 30,
                    onComplete: () => ghost.destroy()
                });
            });
        }

    }

}