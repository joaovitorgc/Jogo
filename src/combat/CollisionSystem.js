import Phaser from 'phaser';
import GameConfig from '../config/GameConfig.js';

export default class CollisionSystem {

    constructor(scene) {
        this.scene = scene;
    }

    checkProjectiles(projectiles, player1, player2) {

        for (let i = projectiles.length - 1; i >= 0; i--) {

            const proj = projectiles[i];
            if (!proj.alive || !proj.sprite) continue;

            const target = proj.owner === player1 ? player2 : player1;

            if (!target.isAlive || target.isInvincible) continue;

            const dist = Phaser.Math.Distance.Between(
                proj.sprite.x, proj.sprite.y,
                target.sprite.x, target.sprite.y
            );

            const hitRadius = (proj.sprite.radius || 18) + 35;

            if (dist < hitRadius) {
                this.scene.damageSystem.processProjectileHit(
                    proj, target, proj.owner
                );
            }

        }

    }

    checkMeleeRange(player1, player2) {

        const dist = Phaser.Math.Distance.Between(
            player1.sprite.x, player1.sprite.y,
            player2.sprite.x, player2.sprite.y
        );

        return dist <= GameConfig.attackRange;

    }

    // Impede que os dois jogadores se sobreponham
    resolvePlayerOverlap(player1, player2) {

        if (!player1.isAlive || !player2.isAlive) return;

        const dist = Phaser.Math.Distance.Between(
            player1.sprite.x, player1.sprite.y,
            player2.sprite.x, player2.sprite.y
        );

        const minDist = 75; // 2 * raio do jogador + margem

        if (dist < minDist && dist > 0) {
            const dx = player2.sprite.x - player1.sprite.x;
            const dy = player2.sprite.y - player1.sprite.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const overlap = (minDist - dist) / 2;

            player1.sprite.x -= (dx / len) * overlap;
            player1.sprite.y -= (dy / len) * overlap;
            player2.sprite.x += (dx / len) * overlap;
            player2.sprite.y += (dy / len) * overlap;

            player1._clampToBounds();
            player2._clampToBounds();
        }

    }

}