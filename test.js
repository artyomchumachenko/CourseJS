// Canvas
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight - 1;

let score = 0;
let gameFrame = 0;
ctx.font = '40px Georgia';
let gameSpeed = 1;
let gameOver = false;
let nextGame = false;
const enemy1 = new Enemy();
const enemy2 = new Enemy();
const enemy3 = new Enemy();
const enemy4 = new Enemy();
var spawnSecondEnemy = false;
var levelTwo = false;
var levelThree = false;
var constToLevelTwo = 30;
var constToLevelThree = 50;

// Mouse
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    click: false
}
canvas.addEventListener('mousedown', function (event) {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function () {
    mouse.click = false;
})

function refreshState(ts) {
    if (gameFrame % 5 == 0) {
        ts.frame++;
        if (ts.frame >= 12) {
            ts.frame = 0;
        }
        if (ts.frame == 3 || ts.frame == 7 || ts.frame == 11) {
            ts.frameX = 0;
        } else {
            ts.frameX++;
        }
        if (ts.frame < 3) {
            ts.frameY = 0;
        } else if (ts.frame < 7) {
            ts.frameY = 1;
        } else if (ts.frame < 11) {
            ts.frameY = 2;
        } else {
            ts.frameY = 0;
        }
    }
}

// Player
const playerLeft = new Image();
playerLeft.src = 'playerCopyLeft.png';
const playerRight = new Image();
playerRight.src = 'playerCopyRight.png';

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        if (mouse.x != this.x) {
            this.x -= dx / 25;
        }
        if (mouse.y != this.y) {
            this.y -= dy / 25;
        }

        // Refresh State Player
        refreshState(this);
    }

    draw() {
        // if (mouse.click) {
        //     ctx.lineWidth = 0.2;
        //     ctx.beginPath();
        //     ctx.moveTo(this.x, this.y);
        //     ctx.lineTo(mouse.x, mouse.y);
        //     ctx.stroke();
        // }

        /*ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);*/

        // Надо вспомнить
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.x >= mouse.x) {
            ctx.drawImage(playerLeft, this.frameX = this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth,
                this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
        } else {
            ctx.drawImage(playerRight, this.frameX = this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth,
                this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
        }
        ctx.restore();
    }
}

const player = new Player();

// Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'bubble_pop_frame_01.png';
const coefHandleBubbleSize = 2.71;

class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 200;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1; // ?
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }

    update() {
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
    }

    draw() {
        /*ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();*/

        ctx.drawImage(bubbleImage, this.x - 68, this.y - 67, this.radius * coefHandleBubbleSize, this.radius * coefHandleBubbleSize);
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'bubbles-single1.wav';


function handleBubbles() {
    if (gameFrame % 50 == 0) {
        bubblesArray.push(new Bubble());
    }
    for (let i = 0; i < bubblesArray.length; i++) {
        bubblesArray[i].update();
        bubblesArray[i].draw();
        if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2) {
            bubblesArray.splice(i, 1);
            i--;
        } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
            if (bubblesArray[i].sound == 'sound1') {
                bubblePop1.play();
            } else {
                bubblePop2.play();
            }
            score++;
            bubblesArray.splice(i, 1);
            i--;
        }
    }
}

// Repeating backgrounds
const background = new Image();
const backgroundMirror = new Image();
background.src = 'ocean1.jpg';
backgroundMirror.src = 'ocean2.jpg';

const BG = {
    x1: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
}

const BGM = {
    x1: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height,
}

function handleBackground() {
    BG.x1 -= gameSpeed;
    BGM.x1 -= gameSpeed;

    if (BG.x1 <= -BG.width) {
        BG.x1 = BG.width;
        // console.log("Левый край main зашел за -width");
    }

    if (BGM.x1 <= -BG.width) {
        BGM.x1 = BGM.width;
        // console.log("Левый край миррора зашел за -width");
    }

    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(backgroundMirror, BGM.x1, BGM.y, BGM.width, BGM.height);
}

// Enemies
const enemyImage = new Image();
enemyImage.src = 'enemy2.png';

class Enemy {
    constructor() {
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90;
        this.radius = 60;
        this.speed = Math.random() * 5 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }

    draw() {
        /*ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();*/

        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth,
            this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 3, this.spriteHeight / 3);
    }

    update() {
        this.x -= this.speed;
        if (this.x < 0) {
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
        }

        // Refresh State Enemies
        refreshState(this);

        // collision with player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distancePlayerToEnemy = Math.sqrt(dx * dx + dy * dy);
        if (distancePlayerToEnemy < this.radius + player.radius) {
            handleGameOver();
        }
    }
}

function handleEnemies() {
    enemy1.draw();
    enemy1.update();
    if (enemy1.x < canvas.width / 2) {
        spawnSecondEnemy = true;
    }
    if (spawnSecondEnemy) {
        enemy2.draw();
        enemy2.update();
    }
    if (score > constToLevelTwo) {
        levelTwo = true;
        enemy1.speed = this.speed = Math.random() * 5 + 4;
    }
    if (score > constToLevelThree) {
        levelThree = true;
        enemy2.speed = this.speed = Math.random() * 7 + 4;
        enemy3.speed = this.speed = Math.random() * 9 + 4;
    }
    if (levelTwo) {
        enemy3.draw();
        enemy3.update();
    }
    if (levelThree) {
        enemy4.draw();
        enemy4.update();
    }
}

function handleGameOver() {
    let questionToNextGame = "Хотите начать сначала?";
    nextGame = confirm("Your score = " + score + "\n" + questionToNextGame);
    gameOver = true;
}

// Animation Loop

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground();
    handleBubbles();
    player.update();
    player.draw();
    handleEnemies();
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 35);
    gameFrame++;
    if (!gameOver) {
        requestAnimationFrame(animate);
    } else if (nextGame) {
        location.reload();
    } else if (!nextGame) {
        window.close();
    }
}

animate();

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
});