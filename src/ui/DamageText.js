export default class DamageText {

    constructor(scene) {
        this.scene = scene;
    }

    show(x, y, amount, isCritical = false) {

        const roundedAmount = Math.round(amount);

        // Tamanho baseado no dano
        let size = 24;
        let color = '#ff4444';

        if (roundedAmount >= 80) {
            size = 48;
            color = '#ff0000';
            isCritical = true;
        } else if (roundedAmount >= 50) {
            size = 38;
            color = '#ff4400';
        } else if (roundedAmount >= 25) {
            size = 30;
            color = '#ff6600';
        }

        if (isCritical) {
            color = '#ff2222';
        }

        const offsetX = (Math.random() - 0.5) * 40;

        const txt = this.scene.add.text(
            x + offsetX, y - 30,
            isCritical ? `💥 ${roundedAmount}!` : `${roundedAmount}`,
            {
                fontSize: `${size}px`,
                fontFamily: 'Arial Black',
                color,
                stroke: '#000000',
                strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(50);

        // Animação diferente para crítico
        if (isCritical) {
            this.scene.tweens.add({
                targets: txt,
                scaleX: 1.4, scaleY: 1.4,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: txt,
                        y: y - 130, alpha: 0,
                        duration: 900, ease: 'Cubic.easeOut',
                        onComplete: () => txt.destroy()
                    });
                }
            });
        } else {
            this.scene.tweens.add({
                targets: txt,
                y: y - 110, alpha: 0,
                duration: 800, ease: 'Cubic.easeOut',
                onComplete: () => txt.destroy()
            });
        }

    }

    showHeal(x, y, amount) {

        const txt = this.scene.add.text(
            x, y - 30,
            `+${Math.round(amount)}`,
            {
                fontSize: '26px',
                fontFamily: 'Arial Black',
                color: '#00ff88',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(50);

        this.scene.tweens.add({
            targets: txt,
            y: y - 110, alpha: 0,
            duration: 900, ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });

    }

}