export default class ComboCounter {

    constructor(scene, x, y, color) {

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
        this.count = 0;
        this.active = false;
        this.textObject = null;
        this.subText = null;
        this.resetTimer = null;

    }

    hit() {

        this.count++;
        this.active = true;

        if (this.resetTimer) {
            this.resetTimer.remove();
        }

        this._show();

        // Janela de combo de 800ms
        this.resetTimer = this.scene.time.delayedCall(800, () => {
            this._reset();
        });

    }

    _show() {

        if (this.textObject) this.textObject.destroy();
        if (this.subText) this.subText.destroy();

        if (this.count < 2) return;

        const colorHex = `#${this.color.toString(16).padStart(6, '0')}`;
        const mult = (1 + (this.count - 1) * 0.15).toFixed(1);

        this.textObject = this.scene.add.text(
            this.x, this.y,
            `${this.count} HIT`,
            {
                fontSize: `${Math.min(20 + this.count * 3, 52)}px`,
                fontFamily: 'Arial Black',
                color: colorHex,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(55);

        this.subText = this.scene.add.text(
            this.x, this.y + 32,
            `x${mult} DMG`,
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffcc00',
                stroke: '#000', strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(55);

        // Bounce ao aparecer
        this.textObject.setScale(1.4, 1.4);
        this.scene.tweens.add({
            targets: [this.textObject, this.subText],
            scaleX: 1, scaleY: 1,
            duration: 150, ease: 'Back.easeOut'
        });

    }

    _reset() {

        this.count = 0;
        this.active = false;

        if (this.textObject) {
            this.scene.tweens.add({
                targets: [this.textObject, this.subText],
                alpha: 0, scaleX: 0.5, scaleY: 0.5,
                duration: 200,
                onComplete: () => {
                    if (this.textObject) this.textObject.destroy();
                    if (this.subText) this.subText.destroy();
                    this.textObject = null;
                    this.subText = null;
                }
            });
        }

    }

    getMultiplier() {

        if (this.count < 2) return 1;
        return Math.min(1 + (this.count - 1) * 0.15, 2.5);

    }

    destroy() {

        if (this.textObject) this.textObject.destroy();
        if (this.subText) this.subText.destroy();
        if (this.resetTimer) this.resetTimer.remove();

    }

}