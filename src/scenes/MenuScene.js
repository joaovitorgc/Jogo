import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {

    constructor() {
        super('MenuScene');
    }

    create() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.fadeIn(1000);

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x0d1117
        );

        this.add.text(
            width / 2,
            180,
            'BATALHA ELEMENTAL',
            {
                fontSize: '72px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#00ffff',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        this.add.text(
            width / 2,
            270,
            'Ultimate Edition',
            {
                fontSize: '30px',
                color: '#aaaaaa'
            }
        ).setOrigin(0.5);

        const startButton = this.add.text(
            width / 2,
            height / 2 + 50,
            'INICIAR',
            {
                fontSize: '42px',
                backgroundColor: '#00aaff',
                padding: {
                    left: 30,
                    right: 30,
                    top: 15,
                    bottom: 15
                }
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
        });

        startButton.on('pointerout', () => {
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            this.scene.start('CharacterSelectScene');
        });

        this.tweens.add({
            targets: startButton,
            scale: 1.05,
            duration: 900,
            yoyo: true,
            repeat: -1
        });
    }
}