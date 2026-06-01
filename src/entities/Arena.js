import Phaser from 'phaser';
import ArenaConfig from '../config/ArenaConfig.js';

export default class Arena {

    constructor(scene, arenaId = 'default') {

        this.scene = scene;
        this.config = ArenaConfig[arenaId] || ArenaConfig.default;

        this._buildBackground();
        this._buildFloor();
        this._buildDecorations();

    }

    _buildBackground() {

        const cfg = this.config;
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        // Fundo base
        this.bg = this.scene.add.rectangle(
            w / 2, h / 2, w, h, cfg.bgColor
        ).setDepth(0);

        // Grade futurista no fundo
        this._drawGrid(w, h);

        // Vinheta lateral
        const leftVig = this.scene.add.rectangle(0, h / 2, 120, h, 0x000000, 0.4)
            .setOrigin(0, 0.5).setDepth(2);

        const rightVig = this.scene.add.rectangle(w, h / 2, 120, h, 0x000000, 0.4)
            .setOrigin(1, 0.5).setDepth(2);

    }

    _drawGrid(w, h) {

        const graphics = this.scene.add.graphics().setDepth(1);
        graphics.lineStyle(1, this.config.ambientColor, 0.06);

        // Linhas verticais
        for (let x = 0; x < w; x += 80) {
            graphics.lineBetween(x, 0, x, h);
        }

        // Linhas horizontais
        for (let y = 0; y < h; y += 80) {
            graphics.lineBetween(0, y, w, y);
        }

        // Linha do horizonte
        graphics.lineStyle(2, this.config.ambientColor, 0.2);
        graphics.lineBetween(0, this.config.floorY, w, this.config.floorY);

    }

    _buildFloor() {

        const cfg = this.config;
        const w = this.scene.cameras.main.width;

        // Chão principal
        this.floor = this.scene.add.rectangle(
            w / 2,
            cfg.floorY + cfg.floorHeight / 2,
            w,
            cfg.floorHeight,
            cfg.floorColor
        ).setDepth(3);

        // Linha de brilho no chão
        this.floorLine = this.scene.add.rectangle(
            w / 2, cfg.floorY, w, 3, this.config.ambientColor, 0.6
        ).setDepth(4);

        // Pulso da linha do chão
        this.scene.tweens.add({
            targets: this.floorLine,
            alpha: 0.15,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    }

    _buildDecorations() {

        const w = this.scene.cameras.main.width;
        const cfg = this.config;

        // Pilares laterais
        const pillarLeft = this.scene.add.rectangle(
            90, cfg.floorY / 2, 20, cfg.floorY, cfg.floorColor
        ).setDepth(3);
        pillarLeft.setStrokeStyle(2, cfg.ambientColor, 0.4);

        const pillarRight = this.scene.add.rectangle(
            w - 90, cfg.floorY / 2, 20, cfg.floorY, cfg.floorColor
        ).setDepth(3);
        pillarRight.setStrokeStyle(2, cfg.ambientColor, 0.4);

        // Marcação do centro (linha central)
        const centerLine = this.scene.add.rectangle(
            w / 2, cfg.floorY / 2, 2, cfg.floorY, cfg.ambientColor, 0.08
        ).setDepth(3);

        // Cantos decorativos
        this._drawCorner(60, 60, cfg.ambientColor, 0.3);
        this._drawCorner(w - 60, 60, cfg.ambientColor, 0.3);

        // Partículas de ambiente flutuando
        this._startAmbientParticles();

    }

    _drawCorner(x, y, color, alpha) {

        const g = this.scene.add.graphics().setDepth(3);
        g.lineStyle(2, color, alpha);
        g.lineBetween(x - 20, y, x + 20, y);
        g.lineBetween(x, y - 20, x, y + 20);

    }

    _startAmbientParticles() {

        const cfg = this.config;

        this.scene.time.addEvent({
            delay: 800,
            callback: () => {
                const x = Phaser.Math.Between(100, 1500);
                const y = Phaser.Math.Between(100, 700);
                const p = this.scene.add.circle(
                    x, y,
                    Phaser.Math.Between(2, 6),
                    cfg.ambientColor, 0.4
                ).setDepth(2);

                this.scene.tweens.add({
                    targets: p,
                    y: y - Phaser.Math.Between(60, 150),
                    alpha: 0,
                    duration: Phaser.Math.Between(1500, 3000),
                    ease: 'Cubic.easeOut',
                    onComplete: () => p.destroy()
                });
            },
            loop: true
        });

    }

}