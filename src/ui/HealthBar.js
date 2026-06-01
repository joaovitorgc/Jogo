export default class HealthBar {

    constructor(scene, x, y, width, height, maxHp, color) {

        this.scene = scene;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;

        // Fundo (borda e sombra)
        this.border = scene.add.rectangle(x, y, width + 6, height + 6, 0x000000, 0.8)
            .setDepth(60);

        this.background = scene.add.rectangle(x, y, width, height, 0x222222)
            .setDepth(61);

        // Barra de dano lenta (lag de HP)
        this.lagBar = scene.add.rectangle(
            x - width / 2, y, 0, height, 0xff8800
        ).setOrigin(0, 0.5).setDepth(62);

        // Barra principal
        this.bar = scene.add.rectangle(
            x - width / 2, y, width, height, color
        ).setOrigin(0, 0.5).setDepth(63);

        // Brilho no topo da barra
        this.shine = scene.add.rectangle(
            x - width / 2, y - height / 4, width, height / 4, 0xffffff, 0.12
        ).setOrigin(0, 0.5).setDepth(64);

        this.targetWidth = width;
        this.lagWidth = width;

        // Atualizar lag bar suavemente
        scene.time.addEvent({
            delay: 50,
            callback: this._updateLag,
            callbackScope: this,
            loop: true
        });

    }

    _updateLag() {

        if (this.lagWidth > this.bar.width) {
            this.lagWidth = Phaser.Math.Linear(this.lagWidth, this.bar.width, 0.07);
            this.lagBar.width = this.lagWidth;
        }

    }

    update(currentHp) {

        this.currentHp = Math.max(currentHp, 0);
        const pct = this.currentHp / this.maxHp;
        const newWidth = this.width * pct;

        // Animar suavemente
        this.scene.tweens.add({
            targets: this.bar,
            width: newWidth,
            duration: 120,
            ease: 'Cubic.easeOut'
        });

        this.scene.tweens.add({
            targets: this.shine,
            width: newWidth,
            duration: 120,
            ease: 'Cubic.easeOut'
        });

        // Cor muda com o HP
        if (pct < 0.25) {
            this.bar.setFillStyle(0xff2222);
        } else if (pct < 0.5) {
            this.bar.setFillStyle(0xff8800);
        } else {
            this.bar.setFillStyle(this.color);
        }

        this.targetWidth = newWidth;

    }

    // Posicionar a partir da borda direita (para P2)
    setFlipped(flipped) {

        if (flipped) {
            this.bar.setOrigin(1, 0.5);
            this.lagBar.setOrigin(1, 0.5);
            this.shine.setOrigin(1, 0.5);

            this.bar.x = this.x + this.width / 2;
            this.lagBar.x = this.x + this.width / 2;
            this.shine.x = this.x + this.width / 2;
        }

    }

}