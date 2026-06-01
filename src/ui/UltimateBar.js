export default class UltimateBar {

    constructor(scene, x, y, width, height, maxCharge, color, flipped = false) {

        this.scene = scene;
        this.maxCharge = maxCharge;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.flipped = flipped;
        this.isReady = false;

        // Fundo
        this.background = scene.add.rectangle(x, y, width, height, 0x111111)
            .setDepth(61);
        this.background.setStrokeStyle(1, 0x444444, 0.5);

        // Barra
        const originX = flipped ? 1 : 0;
        const barX = flipped ? x + width / 2 : x - width / 2;

        this.bar = scene.add.rectangle(
            barX, y, 0, height, color
        ).setOrigin(originX, 0.5).setDepth(62);

        // Label "ULTIMATE"
        this.label = scene.add.text(
            x, y,
            'ULTIMATE',
            {
                fontSize: '11px',
                color: '#888888',
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5).setDepth(63);

        // Efeito de pulsação quando pronta
        this.glowTween = null;

    }

    update(currentCharge) {

        const pct = Math.min(currentCharge / this.maxCharge, 1);
        const newWidth = this.width * pct;

        this.bar.width = newWidth;

        if (pct >= 1 && !this.isReady) {
            this.isReady = true;
            this._onReady();
        } else if (pct < 1 && this.isReady) {
            this.isReady = false;
            this._onDepleted();
        }

    }

    _onReady() {

        this.bar.setFillStyle(0xffd700);
        this.label.setColor('#ffd700');
        this.label.setText('ULTIMATE ▶');

        this.glowTween = this.scene.tweens.add({
            targets: this.bar,
            alpha: 0.5,
            duration: 350,
            yoyo: true,
            repeat: -1
        });

    }

    _onDepleted() {

        if (this.glowTween) {
            this.glowTween.stop();
            this.glowTween = null;
        }

        this.bar.setFillStyle(this.color);
        this.bar.setAlpha(1);
        this.label.setColor('#888888');
        this.label.setText('ULTIMATE');

    }

}