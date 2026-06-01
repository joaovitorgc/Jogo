export default class HealthBar {

    constructor(scene, x, y, width, height, maxHp, color) {

        this.scene = scene;

        this.maxHp = maxHp;

        this.background = scene.add.rectangle(
            x,
            y,
            width,
            height,
            0x333333
        );

        this.bar = scene.add.rectangle(
            x,
            y,
            width,
            height,
            color
        );

        this.width = width;

    }

    update(currentHp) {

        const percentage =
            Math.max(currentHp, 0) /
            this.maxHp;

        this.bar.width =
            this.width * percentage;

    }

}
