import Phaser from 'phaser';
import assets from '../assets';
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gridSize = 5;
        this.tileSize = 24;
        this.candies = [];
        this.selectedCandy = null;
        this.gameOver = false;
        this.isFilling = false;
        this.timeLeft = 30;
        this.score = 0;

    }

    preload() {
        this.load.image('candy1', assets.lambo);
        this.load.image('candy2', assets.porsche);
        this.load.image('candy3', assets.benz);
        this.load.image('candy4', assets.bmw);
        this.load.image('candy5', assets.ferrari);
    }

    create() {

        this.cameras.main.setBackgroundColor('#1a1a1a');

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const boardSize = Math.min(screenWidth, screenHeight * 0.8);
        this.tileSize = Math.floor(boardSize / this.gridSize);

        const boardHeight = this.gridSize * this.tileSize;
        const boardStartY = (screenHeight - boardHeight) / 2;
        const infoY = boardStartY + boardHeight + 20;
        this.gridStartY = boardStartY;

        this.titleText = this.add.text(this.sys.game.config.width / 2, 20, 'LOGO CRUSH', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tileSize = screenWidth / this.gridSize;
        this.scoreText = this.add.text(screenWidth * 0.25, infoY, 'Score: 0', {
            fontSize: '36px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 1).setDepth(10).setScrollFactor(0);



        // Timer text on the right side (75% of screen width)
        this.timerText = this.add.text(screenWidth * 0.75, infoY, `Time: ${this.timeLeft}`, {
            fontSize: '36px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 1).setDepth(10).setScrollFactor(0);

        // Start countdown timer
        this.timeEvent = this.time.addEvent({
            delay: 1000, // 1 second
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`Time: ${this.timeLeft}`);
                if (this.timeLeft <= 0 && !this.gameOver) {
                    this.gameOver = true;
                    this.timeEvent.remove();
                    this.time.delayedCall(100, () => {
                        this.showRestartButton('⏰ Time’s up!');
                    })
                }
            },
            loop: true
        });
        this.createBoard();
        this.input.on('pointerdown', this.selectCandy, this);
        this.noMatchPopup = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height / 2).setDepth(10).setVisible(false);

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRoundedRect(-150, -75, 300, 150, 16);
        this.noMatchPopup.add(graphics);

        const text = this.add.text(0, -30, 'OOPS No Matchable!', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
        }).setOrigin(0.5);
        this.noMatchPopup.add(text);

        const restartBtn = this.add.text(0, 30, 'Restart', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'Arial',
            backgroundColor: '#333',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            // this.scene.start('StartScene'); 
            this.noMatchPopup.setVisible(false);
            this.restartBoard();
        });


        this.noMatchPopup.add(restartBtn);

    }

    onTimerTick() {
        if (this.gameOver) {
            this.timerEvent.remove(false); // stop the timer if game over
            return;
        }

        this.timeLeft -= 1;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        if (this.timeLeft <= 0) {
            this.gameOver = true;
            this.timerEvent.remove(false);
            this.time.delayedCall(100, () => {
                this.showRestartButton('⏰ Time is up! Game Over!');
            })
        }
    }
    checkNoMoves() {
        if (!this.hasPossibleMoves()) {
            // this.noMatchPopup.setVisible(true);
            this.gameOver = true;
            this.timerEvent.remove(false);




            this.time.delayedCall(100, () => {
                this.showRestartButton('🎉You are Out of Moves!');
            })
        }
    }
    createBoard() {
        const types = ['candy1', 'candy2', 'candy3', 'candy4', 'candy5'];

        for (let row = 0; row < this.gridSize; row++) {
            this.candies[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                let type;
                do {
                    type = Phaser.Utils.Array.GetRandom(types);
                } while (this.causesInitialMatch(row, col, type));

                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;
                const border = this.add.graphics();
                border.lineStyle(2, 0x000000, 1); // white border, 2px
                border.strokeRect(
                    col * this.tileSize,
                    row * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
                const candy = this.add.image(x, y, type).setInteractive();
                candy.setDisplaySize(this.tileSize, this.tileSize);
                candy.setData('row', row);
                candy.setData('col', col);
                candy.setData('type', type);

                this.candies[row][col] = candy;
            }
        }
    }

    causesInitialMatch(row, col, type) {
        // Check horizontal
        if (col >= 2) {
            const left1 = this.candies[row][col - 1];
            const left2 = this.candies[row][col - 2];
            if (left1 && left2 && left1.texture.key === type && left2.texture.key === type) {
                return true;
            }
        }

        // Check vertical
        if (row >= 2) {
            const up1 = this.candies[row - 1][col];
            const up2 = this.candies[row - 2][col];
            if (up1 && up2 && up1.texture.key === type && up2.texture.key === type) {
                return true;
            }
        }

        return false;
    }

    selectCandy(pointer) {
        if (this.gameOver) return;
        const x = pointer.x;
        const y = pointer.y;
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        if (this.selectedCandy) {
            const oldRow = this.selectedCandy.getData('row');
            const oldCol = this.selectedCandy.getData('col');

            if (Math.abs(oldRow - row) + Math.abs(oldCol - col) === 1) {
                this.swapCandies(oldRow, oldCol, row, col);
                this.selectedCandy = null;
            } else {
                this.selectedCandy = this.candies[row][col];
            }
        } else {
            this.selectedCandy = this.candies[row][col];
        }
    }

    swapCandies(r1, c1, r2, c2) {
        const candy1 = this.candies[r1][c1];
        const candy2 = this.candies[r2][c2];

        this.tweens.add({
            targets: candy1,
            x: candy2.x,
            y: candy2.y,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: candy2,
            x: candy1.x,
            y: candy1.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Swap in array
                this.candies[r1][c1] = candy2;
                this.candies[r2][c2] = candy1;

                candy1.setData('row', r2);
                candy1.setData('col', c2);
                candy2.setData('row', r1);
                candy2.setData('col', c1);

                // Check matches after swap
                const matchesExist = this.hasMatch();

                if (matchesExist) {
                    this.checkMatches();
                } else {
                    // Reswap back
                    this.tweens.add({
                        targets: candy1,
                        x: candy2.x,
                        y: candy2.y,
                        duration: 200,
                        ease: 'Power2'
                    });

                    this.tweens.add({
                        targets: candy2,
                        x: candy1.x,
                        y: candy1.y,
                        duration: 200,
                        ease: 'Power2',
                        onComplete: () => {
                            // Swap back in array
                            this.candies[r1][c1] = candy1;
                            this.candies[r2][c2] = candy2;

                            candy1.setData('row', r1);
                            candy1.setData('col', c1);
                            candy2.setData('row', r2);
                            candy2.setData('col', c2);
                        }
                    });
                }
            }
        });
    }
    hasMatch() {
        // Horizontal
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize - 2; col++) {
                const a = this.candies[row][col];
                const b = this.candies[row][col + 1];
                const c = this.candies[row][col + 2];
                if (a && b && c && a.texture.key === b.texture.key && b.texture.key === c.texture.key) {
                    return true;
                }
            }
        }

        // Vertical
        for (let col = 0; col < this.gridSize; col++) {
            for (let row = 0; row < this.gridSize - 2; row++) {
                const a = this.candies[row][col];
                const b = this.candies[row + 1][col];
                const c = this.candies[row + 2][col];
                if (a && b && c && a.texture.key === b.texture.key && b.texture.key === c.texture.key) {
                    return true;
                }
            }
        }

        return false;
    }
    hasPossibleMoves() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.candies[row][col];
                if (!current) continue;

                const swaps = [
                    [0, 1], // right
                    [1, 0]  // down
                ];

                for (let [dr, dc] of swaps) {
                    const r2 = row + dr;
                    const c2 = col + dc;

                    if (r2 < this.gridSize && c2 < this.gridSize) {
                        const neighbor = this.candies[r2][c2];
                        if (!neighbor) continue;

                        // Swap temporarily
                        this.candies[row][col] = neighbor;
                        this.candies[r2][c2] = current;

                        const matchExists = this.hasMatch();

                        // Swap back
                        this.candies[row][col] = current;
                        this.candies[r2][c2] = neighbor;

                        if (matchExists) return true;
                    }
                }
            }
        }

        return false;
    }

    checkMatches() {
        const matches = [];

        // Find horizontal matches
        for (let row = 0; row < this.gridSize; row++) {
            let matchGroup = [this.candies[row][0]];
            for (let col = 1; col < this.gridSize; col++) {
                const currentCandy = this.candies[row][col];
                const lastCandy = matchGroup[0];

                if (currentCandy && lastCandy && currentCandy.texture.key === lastCandy.texture.key) {
                    matchGroup.push(currentCandy);
                } else {
                    if (matchGroup.length >= 3) matches.push(matchGroup);
                    matchGroup = currentCandy ? [currentCandy] : [];
                }
            }
            if (matchGroup.length >= 3) matches.push(matchGroup);
        }
        // Find vertical matches
        for (let col = 0; col < this.gridSize; col++) {
            let matchGroup = [this.candies[0][col]];
            for (let row = 1; row < this.gridSize; row++) {
                const currentCandy = this.candies[row][col];
                const lastCandy = matchGroup[0];

                if (currentCandy && lastCandy && currentCandy.texture.key === lastCandy.texture.key) {
                    matchGroup.push(currentCandy);
                } else {
                    if (matchGroup.length >= 3) matches.push(matchGroup);
                    matchGroup = currentCandy ? [currentCandy] : [];
                }
            }
            if (matchGroup.length >= 3) matches.push(matchGroup);
        }
        this.clearMatches(matches);
    }

    clearMatches(matchGroups) {
        let totalPoints = 0;
        const candiesToDestroy = new Set();

        // Calculate points and mark candies to destroy
        for (const group of matchGroups) {
            const count = group.length;

            if (count === 3) totalPoints += 2;
            else if (count === 4) totalPoints += 5;
            else if (count >= 5) totalPoints += 10;

            // Mark candies to destroy, avoiding duplicates with a Set
            group.forEach(candy => candiesToDestroy.add(candy));
        }

        // Destroy candies
        candiesToDestroy.forEach(candy => {
            const row = candy.getData('row');
            const col = candy.getData('col');
            if (this.candies[row][col] === candy) {
                this.candies[row][col] = null;
            }
            candy.destroy();
        });

        this.updateScore(totalPoints);
        this.fillBoard();
    }


    restartBoard() {
        // Remove all candies
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.candies[row][col]) {
                    this.candies[row][col].destroy();
                }
            }
        }

        this.candies = [];
        this.createBoard();

        // Reset timer
        this.timeLeft = 30
        this.timerText.setText(`Time: ${this.timeLeft}`);

        // Restart timer event if needed
        if (!this.timerEvent || this.timerEvent.hasDispatched) {
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.onTimerTick,
                callbackScope: this,
                loop: true
            });
        }
    }

    updateScore(points) {
        if (points > 0) {
            this.score += points;
            this.scoreText.setText('Score: ' + this.score);
        }
        if (this.score >= 50 && !this.gameOver) {
            this.gameOver = true;
            if (this.timeEvent) {
                this.timeEvent.remove(false);
                this.timeEvent = null;
            }
            this.time.delayedCall(400, () => {
                this.showRestartButton('🎉 You reached 50 points!');
            })
        }
    }
    showRestartButton(message) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const msgText = this.add.text(centerX, centerY - 60, message, {
            fontSize: '44px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            border: '2px ##FFFF00',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);
        msgText.setStroke('#FFFF00', 4);
        const btn = this.add.text(centerX, centerY + 10, 'Restart', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#FF0000z',
            padding: { x: 20, y: 10 },
            borderRadius: 10
        }).setOrigin(0.5).setInteractive();

        btn.on('pointerdown', () => {
            msgText.destroy();
            btn.destroy();
            this.score = 0;
            this.scoreText.setText('Score: 0');
            this.gameOver = false;
            this.restartBoard();
        });
    }


    fillBoard() {
        if (this.isFilling) return;
        this.isFilling = true;
        const types = ['candy1', 'candy2', 'candy3', 'candy4', 'candy5'];

        for (let col = 0; col < this.gridSize; col++) {
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (!this.candies[row][col]) {
                    for (let r = row - 1; r >= 0; r--) {
                        if (this.candies[r][col]) {
                            const candy = this.candies[r][col];
                            candy.y += this.tileSize * (row - r);
                            candy.setData('row', row);
                            this.candies[row][col] = candy;
                            this.candies[r][col] = null;
                            break;
                        }
                    }

                    if (!this.candies[row][col]) {
                        const type = Phaser.Utils.Array.GetRandom(types);
                        const x = col * this.tileSize + this.tileSize / 2;
                        const y = row * this.tileSize + this.tileSize / 2;

                        const newCandy = this.add.image(x, y, type).setInteractive();
                        newCandy.setDisplaySize(this.tileSize, this.tileSize);
                        newCandy.setData('row', row);
                        newCandy.setData('col', col);
                        newCandy.setData('type', type);
                        this.candies[row][col] = newCandy;
                    }
                }
            }
        }
        this.time.delayedCall(300, () => {
            this.isFilling = false;
            this.checkMatches();
            this.checkNoMoves();
        });
    }
}
export default GameScene;