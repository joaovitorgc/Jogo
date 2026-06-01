export default class LoadingScene extends Phaser.Scene {

    constructor() {
        super('LoadingScene');
    }

    preload() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(
            width / 2,
            height / 2 - 100,
            'CARREGANDO...',
            {
                fontSize: '42px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const progressBox = this.add.rectangle(
            width / 2,
            height / 2,
            500,
            40,
            0x222222
        );

        const progressBar = this.add.rectangle(
            width / 2 - 245,
            height / 2,
            0,
            30,
            0x00ffff
        );

        progressBar.setOrigin(0, 0.5);

        this.load.on('progress', (value) => {

            progressBar.width = 490 * value;

        });

        this.load.on('complete', () => {

            console.log('Assets carregados');

        });

        /*
            Assets do jogo
        */

           /* this.load.image(
                'menu-bg',
                'assets/ui/menu_background.jpg'
            );

            this.load.image(
                'logo',
                'assets/ui/logo.png'
            ); */

    }

    create() {

        this.scene.start('MenuScene');

    }
}