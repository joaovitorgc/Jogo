import Phaser from 'phaser';
import Player from '../entities/Player.js';
import HealthBar from '../ui/HealthBar.js';
import Projectile from '../entities/Projectile.js';

export default class BattleScene extends Phaser.Scene {

    constructor() {
        super('BattleScene');
    }

    create(data) {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x101820
        );

        this.player1 = new Player(
            this,
            300,
            height / 2,
            data.player1
        );

        this.player2 = new Player(
            this,
            width - 300,
            height / 2,
            data.player2
        );

        this.p1Bar = new HealthBar(
        this,
        250,
        50,
        400,
        30,
        this.player1.hp,
        0x00ff00
        );

        this.p2Bar = new HealthBar(
            this,
            1350,
            50,
            400,
            30,
            this.player2.hp,
            0xff0000
        );

        this.keys = this.input.keyboard.addKeys({

            p1up: 'W',
            p1down: 'S',
            p1left: 'A',
            p1right: 'D',
            p1attack: 'F',
            p1special: 'G',

            p2up: 'UP',
            p2down: 'DOWN',
            p2left: 'LEFT',
            p2right: 'RIGHT',
            p2attack: 'ENTER',
            p2special: 'SHIFT'

        });

        this.ProjectileClass = Projectile;
        this.projectiles = [];


    }


    update() {

        this.player1.update(this.keys, true);
        this.player2.update(this.keys, false);

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.p1attack
            )
        ) {

            this.player1.attack(
                this.player2
            );

        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.p2attack
            )
        ) {

            this.player2.attack(
                this.player1
            );

        }

        this.p1Bar.update(
        this.player1.hp
        );

        this.p2Bar.update(
            this.player2.hp
        );

        if (this.player1.hp <= 0) {

            alert('Jogador 2 venceu');

            this.scene.start(
                'CharacterSelectScene'
            );

        }

        if (this.player2.hp <= 0) {

            alert('Jogador 1 venceu');

            this.scene.start(
                'CharacterSelectScene'
            );

        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.p1special
            )
        ) {

            this.player1.specialAttack();

        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.p2special
            )
        ) {

            this.player2.specialAttack();

        }

        for (const projectile of this.projectiles) {

            projectile.update();

            let target =
                projectile.owner === this.player1
                    ? this.player2
                    : this.player1;

            const distance =
                Phaser.Math.Distance.Between(
                    projectile.sprite.x,
                    projectile.sprite.y,
                    target.sprite.x,
                    target.sprite.y
                );

            if (distance < 45) {

                target.hp -= projectile.damage;

                switch (projectile.element) {

                    case 'ice':

                        target.speed *= 0.8;

                        this.time.delayedCall(
                            2000,
                            () => {

                                target.speed =
                                    target.data.velocidade / 60;

                            }
                        );

                        break;

                    case 'darkness':

                        projectile.owner.hp += 5;

                        if (
                            projectile.owner.hp >
                            projectile.owner.data.vida
                        ) {

                            projectile.owner.hp =
                                projectile.owner.data.vida;

                        }

                        break;

                    case 'water':

                        target.sprite.x +=
                            projectile.velocityX * 10;

                        break;

                }

                projectile.sprite.destroy();

                this.projectiles =
                    this.projectiles.filter(
                        p => p !== projectile
                    );

            }

        }

    }


}