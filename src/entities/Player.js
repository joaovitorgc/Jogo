import Phaser from 'phaser';
import CharacterConfig from '../config/CharacterConfig.js';

export default class Player {

    constructor(scene, x, y, element) {

        this.scene = scene;

        this.element = element;

        this.data = CharacterConfig[element];

        this.hp = this.data.vida;

        this.speed = this.data.velocidade / 60;

        this.sprite = scene.add.circle(
            x,
            y,
            35,
            this.data.cor
        );

        this.lastAttack = 0;
        this.attackCooldown = 300;

        this.specialCooldown = 1000;
        this.lastSpecial = 0;

    }

    update(keys, isPlayer1) {

        let up;
        let down;
        let left;
        let right;

        if (isPlayer1) {

            up = keys.p1up;
            down = keys.p1down;
            left = keys.p1left;
            right = keys.p1right;

        } else {

            up = keys.p2up;
            down = keys.p2down;
            left = keys.p2left;
            right = keys.p2right;

        }

        if (up.isDown)
            this.sprite.y -= this.speed;

        if (down.isDown)
            this.sprite.y += this.speed;

        if (left.isDown)
            this.sprite.x -= this.speed;

        if (right.isDown)
            this.sprite.x += this.speed;

    }

    attack(enemy) {

    const now = Date.now();

    if (
        now - this.lastAttack <
        this.attackCooldown
    ) {
        return;
    }

    this.lastAttack = now;

    const attackEffect =
        this.scene.add.circle(
            this.sprite.x,
            this.sprite.y,
            60,
            0xffffff,
            0.5
        );

    this.scene.tweens.add({
        targets: attackEffect,
        scale: 1.5,
        alpha: 0,
        duration: 150,
        onComplete: () => {
            attackEffect.destroy();
        }
    });

    enemy.hp -= this.data.dano;

    const dx =
        enemy.sprite.x -
        this.sprite.x;

    const dy =
        enemy.sprite.y -
        this.sprite.y;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        ) || 1;

    const force = 50;

    enemy.sprite.x +=
        (dx / length) * force;

    enemy.sprite.y +=
        (dy / length) * force;

    }

    specialAttack() {

    const now = Date.now();

    if (
        now - this.lastSpecial <
        this.specialCooldown
    ) {
        return;
    }

    this.lastSpecial = now;

    let direction = 1;

    if (
        this.sprite.x >
        this.scene.cameras.main.width / 2
    ) {
        direction = -1;
    }

    const Projectile =
        this.scene.ProjectileClass;

    let speed = 12;
    let size = 18;
    let damage = 15;

    switch (this.element) {

        case 'fire':
            damage = 25;
            size = 25;
            speed = 14;
            break;

        case 'water':
            damage = 15;
            size = 30;
            speed = 10;
            break;

        case 'electric':
            damage = 20;
            size = 15;
            speed = 20;
            break;

        case 'ice':
            damage = 12;
            size = 25;
            speed = 9;
            break;

        case 'stone':
            damage = 30;
            size = 35;
            speed = 7;
            break;

        case 'wind':
            damage = 10;
            size = 12;
            speed = 25;
            break;

        case 'metal':
            damage = 22;
            size = 20;
            speed = 16;
            break;

        case 'sand':
            damage = 18;
            size = 28;
            speed = 11;
            break;

        case 'darkness':
            damage = 20;
            size = 22;
            speed = 13;
            break;

        case 'sound':
            damage = 17;
            size = 18;
            speed = 18;
            break;

    }

    const projectile = new Projectile(
        this.scene,
        this.sprite.x,
        this.sprite.y,
        this.data.cor,
        speed * direction,
        this
    );

    projectile.damage = damage;
    projectile.element = this.element;

    projectile.sprite.setRadius(size);

    }

}