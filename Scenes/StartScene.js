import Phaser from 'phaser';

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Optionally preload any assets here
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 60, 'Welcome to', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, 'CAR LOGO CRUSH', {
            fontSize: '36px',
            fill: '#ffcc00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'START GAME', {
            fontSize: '24px',
            backgroundColor: '#ffffff',
            color: '#000',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial',
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

export default StartScene;
