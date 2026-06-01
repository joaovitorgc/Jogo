export default class Projectile {

    constructor(
        scene,
        x,
        y,
        color,
        velocityX,
        owner
    ) {

        this.scene = scene;
        this.owner = owner;

        this.sprite = scene.add.circle(
            x,
            y,
            18,
            color
        );

        scene.tweens.add({
            targets: this.sprite,
            scale: 1.3,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        this.velocityX = velocityX;

        scene.projectiles.push(this);

    }

    update() {

        this.sprite.x += this.velocityX;

    }

}
