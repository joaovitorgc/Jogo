export default class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    preload() {

        this.load.image(
            'loading-bg',
            'assets/ui/loading_bg.png'
        );

    }

    create() {

        console.log('BootScene carregada');

        this.scene.start('LoadingScene');

    }
}
