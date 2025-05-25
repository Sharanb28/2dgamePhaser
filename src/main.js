import Phaser from 'phaser';
import GameScene from "./Scenes/GameScene"
import StartScene from "./Scenes/StartScene"
import assets from "./assets";
const config = {
    type: Phaser.AUTO,
    width: '100%',
    height: '100%',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [StartScene, GameScene],
};
// window.addEventListener('resize', () => {
//     game.scale.resize(window.innerWidth, window.innerHeight);
// });

const game = new Phaser.Game(config);
