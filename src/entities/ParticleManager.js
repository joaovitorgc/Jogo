import Phaser from 'phaser';

export default class ParticleManager {

    constructor(scene) {
        this.scene = scene;
    }

    // Explosão genérica
    explosion(x, y, color, count = 12, radius = 30, speed = 200) {

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = Phaser.Math.Between(radius * 0.5, radius * 1.5);

            const p = this.scene.add.circle(
                x, y,
                Phaser.Math.Between(4, 12),
                color, 1
            ).setDepth(20);

            this.scene.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.1, scaleY: 0.1,
                duration: Phaser.Math.Between(300, 600),
                ease: 'Cubic.easeOut',
                onComplete: () => p.destroy()
            });
        }

    }

    // Anel expansivo
    ring(x, y, color, maxScale = 5, duration = 400) {

        const r = this.scene.add.circle(x, y, 30, color, 0).setDepth(20);
        r.setStrokeStyle(3, color, 0.9);

        this.scene.tweens.add({
            targets: r,
            scaleX: maxScale, scaleY: maxScale,
            alpha: 0,
            duration,
            ease: 'Expo.easeOut',
            onComplete: () => r.destroy()
        });

    }

    // Texto flutuante de dano
    damageText(x, y, amount, color = '#ff4444') {

        const txt = this.scene.add.text(
            x + Phaser.Math.Between(-20, 20),
            y - 20,
            `-${amount}`,
            {
                fontSize: '28px',
                fontFamily: 'Arial Black',
                color,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(40);

        this.scene.tweens.add({
            targets: txt,
            y: y - 90,
            alpha: 0,
            scaleX: 1.3, scaleY: 1.3,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });

    }

    // Faíscas de impacto
    sparks(x, y, color, count = 6) {

        for (let i = 0; i < count; i++) {
            const p = this.scene.add.rectangle(
                x, y,
                Phaser.Math.Between(3, 10),
                Phaser.Math.Between(2, 5),
                color
            ).setDepth(22)
            .setRotation(Math.random() * Math.PI);

            this.scene.tweens.add({
                targets: p,
                x: x + Phaser.Math.Between(-60, 60),
                y: y + Phaser.Math.Between(-60, 60),
                alpha: 0, scaleX: 0, scaleY: 0,
                duration: Phaser.Math.Between(200, 400),
                ease: 'Cubic.easeOut',
                onComplete: () => p.destroy()
            });
        }

    }

    // Círculos de energia girando
    orbitalBurst(x, y, color, count = 6, orbitRadius = 50) {

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const orb = this.scene.add.circle(
                x + Math.cos(angle) * orbitRadius,
                y + Math.sin(angle) * orbitRadius,
                10, color, 1
            ).setDepth(22);

            this.scene.tweens.add({
                targets: orb,
                x, y,
                scaleX: 0.1, scaleY: 0.1,
                alpha: 0,
                duration: 400,
                delay: i * 40,
                ease: 'Cubic.easeIn',
                onComplete: () => orb.destroy()
            });
        }

    }

    // Flash de tela
    screenFlash(color = 0xffffff, alpha = 0.4, duration = 300) {

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        const flash = this.scene.add.rectangle(w / 2, h / 2, w, h, color, alpha)
            .setDepth(50);

        this.scene.tweens.add({
            targets: flash, alpha: 0, duration,
            onComplete: () => flash.destroy()
        });

    }

    // Rastro de movimento
    movementTrail(x, y, color, size = 30) {

        const trail = this.scene.add.circle(x, y, size, color, 0.5).setDepth(8);
        this.scene.tweens.add({
            targets: trail, alpha: 0, scaleX: 0.3, scaleY: 0.3,
            duration: 300, onComplete: () => trail.destroy()
        });

    }

}