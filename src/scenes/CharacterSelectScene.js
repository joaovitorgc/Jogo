import Phaser from 'phaser';
import CharacterConfig from '../config/CharacterConfig.js';

export default class CharacterSelectScene extends Phaser.Scene {

    constructor() {
        super('CharacterSelectScene');

        this.player1Choice = null;
        this.player2Choice = null;
        this.currentPlayer = 1;
    }

    create() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x0d1117
        );

        this.titleText = this.add.text(
            width / 2,
            60,
            'JOGADOR 1 - ESCOLHA SEU ELEMENTO',
            {
                fontSize: '36px',
                color: '#ffffff',
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5);

        const characters = Object.values(CharacterConfig);

        const startX = 220;
        const startY = 180;

        const spacingX = 280;
        const spacingY = 230;

        characters.forEach((character, index) => {

            const row = Math.floor(index / 5);
            const col = index % 5;

            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const card = this.add.container(x, y);

            const bg = this.add.rectangle(
                0,
                0,
                220,
                160,
                character.cor
            );

            bg.setStrokeStyle(4, 0xffffff);

            const name = this.add.text(
                0,
                -45,
                character.nome,
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontFamily: 'Arial Black'
                }
            ).setOrigin(0.5);

            const hp = this.add.text(
                0,
                0,
                `HP: ${character.vida}`,
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            const desc = this.add.text(
                0,
                40,
                character.descricao,
                {
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            card.add([
                bg,
                name,
                hp,
                desc
            ]);

            bg.setInteractive({ useHandCursor: true });

            bg.on('pointerover', () => {

                if (bg.selected) return;

                this.tweens.add({
                    targets: card,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 150
                });

            });

            bg.on('pointerout', () => {

                if (bg.selected) return;

                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });

            });

            bg.on('pointerdown', () => {

                if (bg.selected)
                    return;

                this.selectCharacter(
                    character.id,
                    bg,
                    card
                );

            });

        });

    }

    selectCharacter(characterId, bg, card) {

        if (this.currentPlayer === 1) {

            this.player1Choice = characterId;

            bg.selected = true;

            bg.setFillStyle(0x00ff88);

            this.titleText.setText(
                'JOGADOR 2 - ESCOLHA SEU ELEMENTO'
            );

            this.currentPlayer = 2;

            return;
        }

        if (characterId === this.player1Choice)
            return;

        this.player2Choice = characterId;

        bg.selected = true;

        bg.setFillStyle(0xff4444);

        this.showStartButton();
    }

    showStartButton() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const button = this.add.text(
            width / 2,
            height - 70,
            'INICIAR BATALHA',
            {
                fontSize: '34px',
                color: '#ffffff',
                backgroundColor: '#00aa88',
                padding: {
                    left: 30,
                    right: 30,
                    top: 15,
                    bottom: 15
                }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {

            button.setScale(1.1);

        });

        button.on('pointerout', () => {

            button.setScale(1);

        });

        button.on('pointerdown', () => {

            this.scene.start(
                'BattleScene',
                {
                    player1: this.player1Choice,
                    player2: this.player2Choice
                }
            );

        });

    }

}