import Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import BattleScene from './scenes/BattleScene.js';


const config = {
    type: Phaser.AUTO,

    parent: 'game-container',

    width: 1600,
    height: 900,

    backgroundColor: '#0d1117',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },

    fps: {
        target: 60,
        forceSetTimeOut: true
    },

    scene: [
    BootScene,
    LoadingScene,
    MenuScene,
    CharacterSelectScene,
    BattleScene
    ]
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
});