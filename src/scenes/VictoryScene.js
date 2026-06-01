import Phaser from 'phaser';
import CharacterConfig from '../config/CharacterConfig.js';

export default class VictoryScene extends Phaser.Scene {

    constructor() {
        super('VictoryScene');
    }

    create(data) {

        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        const winner = data?.winner || 'P1';
        const element = data?.element || 'fire';
        const cfg = CharacterConfig[element];

        this.cameras.main.fadeIn(800);

        // Fundo
        this.add.rectangle(W / 2, H / 2, W, H, 0x0d1117);

        // Partículas de celebração
        this._spawnConfetti(cfg.cor);

        // Círculo do vencedor
        const circle = this.add.circle(W / 2, H / 2 - 60, 80, cfg.cor, 0.9)
            .setScale(0, 0);
        this.tweens.add({
            targets: circle, scaleX: 1, scaleY: 1,
            duration: 500, ease: 'Back.easeOut'
        });

        // Aura pulsante
        const aura = this.add.circle(W / 2, H / 2 - 60, 90, cfg.cor, 0.2);
        this.tweens.add({
            targets: aura, scaleX: 1.4, scaleY: 1.4, alpha: 0,
            duration: 1200, yoyo: true, repeat: -1
        });

        // Título VITÓRIA
        const title = this.add.text(W / 2, 120, 'VITÓRIA!', {
            fontSize: '80px', fontFamily: 'Arial Black',
            color: '#ffd700',
            stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: title, alpha: 1, y: 140,
            duration: 600, ease: 'Cubic.easeOut'
        });

        // Nome do personagem
        const name = this.add.text(W / 2, H / 2 + 50, cfg.nome, {
            fontSize: '48px', fontFamily: 'Arial Black',
            color: `#${cfg.cor.toString(16).padStart(6,'0')}`,
            stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(400, () => {
            this.tweens.add({ targets: name, alpha: 1, duration: 400 });
        });

        // Jogador
        const playerLabel = this.add.text(W / 2, H / 2 + 110, `${winner} VENCEU`, {
            fontSize: '28px', fontFamily: 'Arial',
            color: '#aaaaaa', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(600, () => {
            this.tweens.add({ targets: playerLabel, alpha: 1, duration: 400 });
        });

        // Botões
        this._createButton(W / 2 - 160, H - 120, 'REVANCHE', () => {
            this.scene.start('BattleScene', data?.rematch);
        }, 0x00aa88);

        this._createButton(W / 2 + 160, H - 120, 'MENU', () => {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => this.scene.start('CharacterSelectScene'));
        }, 0x444444);

    }

    _createButton(x, y, label, callback, color) {

        const btn = this.add.text(x, y, label, {
            fontSize: '28px', fontFamily: 'Arial Black',
            color: '#ffffff',
            backgroundColor: `#${color.toString(16).padStart(6,'0')}`,
            padding: { left: 24, right: 24, top: 12, bottom: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

        this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: 800 });

        btn.on('pointerover', () => btn.setScale(1.08));
        btn.on('pointerout',  () => btn.setScale(1));
        btn.on('pointerdown', callback);

    }

    _spawnConfetti(color) {

        for (let i = 0; i < 40; i++) {
            this.time.delayedCall(i * 80, () => {
                const x = Phaser.Math.Between(0, 1600);
                const p = this.add.rectangle(
                    x, -20,
                    Phaser.Math.Between(8, 20),
                    Phaser.Math.Between(8, 20),
                    Phaser.Math.RND.pick([color, 0xffd700, 0xffffff, 0xff4444, 0x00ff88])
                ).setRotation(Math.random() * Math.PI);

                this.tweens.add({
                    targets: p,
                    y: 950,
                    angle: Phaser.Math.Between(-360, 360),
                    duration: Phaser.Math.Between(1500, 3000),
                    ease: 'Linear',
                    onComplete: () => p.destroy()
                });
            });
        }

    }

}