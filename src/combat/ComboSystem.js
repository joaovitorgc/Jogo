import GameConfig from '../config/GameConfig.js';

export default class ComboSystem {

    constructor(scene, player, comboUI) {

        this.scene = scene;
        this.player = player;
        this.comboUI = comboUI;
        this.count = 0;
        this.resetTimer = null;
        this.window = GameConfig.comboWindow;

    }

    registerHit() {

        this.count++;

        if (this.comboUI) {
            this.comboUI.hit();
        }

        // Reiniciar janela de combo
        if (this.resetTimer) this.resetTimer.remove();
        this.resetTimer = this.scene.time.delayedCall(this.window, () => {
            this.reset();
        });

    }

    getMultiplier() {

        if (this.count < 2) return 1;
        const mult = 1 + (this.count - 1) * GameConfig.comboDamageMultiplier;
        return Math.min(mult, 2.5);

    }

    reset() {

        this.count = 0;
        if (this.comboUI) this.comboUI._reset();

    }

}