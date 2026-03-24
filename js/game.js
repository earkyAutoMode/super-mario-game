const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const msgEl = document.getElementById('msg');
const statusEl = document.getElementById('status');

// Constants
const TILE_SIZE = 32;
const GRAVITY = 0.8;
const FRICTION = 0.9;
const JUMP_FORCE = -15;
const SPEED = 5;

// Sprite Sheets (Using stable public assets)
const tilesImg = new Image();
tilesImg.src = 'https://raw.githubusercontent.com/meth-meth-method/super-mario/master/public/img/tiles.png';
const marioImg = new Image();
marioImg.src = 'https://raw.githubusercontent.com/meth-meth-method/super-mario/master/public/img/characters.png';

// Level Data (Simplistic tile-based map)
// 0: Sky, 1: Ground, 2: Brick, 3: Coin Block, 4: Pipe (TL), 5: Pipe (TR), 6: Pipe (BL), 7: Pipe (BR)
const levelMap = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,3,0,0,2,3,2,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,5,0,0,0,0,0,0,0,0,0,0,0,0,4,5,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,0,0,0,0,0,0,0,0,0,0,0,0,6,7,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,0,0,0,0,0,0,0,0,0,0,0,0,6,7,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAP_WIDTH = levelMap[0].length * TILE_SIZE;
const MAP_HEIGHT = levelMap.length * TILE_SIZE;

// Sprite Mapping
const spriteX = {
    1: 0, // Ground
    2: 16, // Brick
    3: 384, // Question Block
    4: 0, // Pipe TL
    5: 16, // Pipe TR
    6: 0, // Pipe BL
    7: 16, // Pipe BR
};
const spriteY = {
    1: 0, 2: 0, 3: 0, 4: 128, 5: 128, 6: 144, 7: 144
};

// Player Object
const player = {
    x: 100,
    y: 300,
    width: 28,
    height: 32,
    vx: 0,
    vy: 0,
    jumping: false,
    direction: 'right',
    frame: 0,
    animTimer: 0,
    score: 0,
    alive: true
};

// State
const keys = {};
let gameActive = true;
let timeRemaining = 400;
let cameraX = 0;

// Input
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function checkCollision(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileY < 0 || tileY >= levelMap.length || tileX < 0 || tileX >= levelMap[0].length) return 0;
    return levelMap[tileY][tileX];
}

function update() {
    if (!player.alive) return;

    // Movement
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx = SPEED;
        player.direction = 'right';
    } else if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx = -SPEED;
        player.direction = 'left';
    } else {
        player.vx *= FRICTION;
    }

    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.vy = JUMP_FORCE;
        player.jumping = true;
    }

    // Physics
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    // Camera
    if (player.x > canvas.width / 2) {
        cameraX = player.x - canvas.width / 2;
    }
    if (cameraX < 0) cameraX = 0;
    if (cameraX > MAP_WIDTH - canvas.width) cameraX = MAP_WIDTH - canvas.width;

    // Ground & Wall Collision
    const feetY = player.y + player.height;
    const centerTileX = Math.floor((player.x + player.width/2) / TILE_SIZE);
    const feetTileY = Math.floor(feetY / TILE_SIZE);

    if (feetTileY < levelMap.length && levelMap[feetTileY][centerTileX] !== 0) {
        player.y = feetTileY * TILE_SIZE - player.height;
        player.vy = 0;
        player.jumping = false;
    }

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.y > MAP_HEIGHT) die();

    // Animation
    if (Math.abs(player.vx) > 0.1) {
        player.animTimer++;
        if (player.animTimer % 5 === 0) player.frame = (player.frame + 1) % 3;
    } else {
        player.frame = 0;
    }

    // Timer
    if (frameCount % 60 === 0 && timeRemaining > 0) {
        timeRemaining--;
        timerEl.innerText = timeRemaining;
        if (timeRemaining <= 0) die();
    }
}

function die() {
    player.alive = false;
    statusEl.innerText = "GAME OVER";
    msgEl.style.display = 'block';
}

let frameCount = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw Map
    for (let r = 0; r < levelMap.length; r++) {
        for (let c = 0; c < levelMap[r].length; c++) {
            const tile = levelMap[r][c];
            if (tile !== 0) {
                ctx.drawImage(
                    tilesImg,
                    spriteX[tile], spriteY[tile], 16, 16, // Source
                    c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE // Dest
                );
            }
        }
    }

    // Draw Player
    let mx = 276; // Standing frame
    if (player.jumping) {
        mx = 355; // Jumping frame
    } else if (Math.abs(player.vx) > 0.1) {
        mx = [290, 304, 321][player.frame]; // Running frames
    }

    ctx.save();
    if (player.direction === 'left') {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(marioImg, mx, 44, 16, 16, 0, 0, player.width, player.height);
    } else {
        ctx.drawImage(marioImg, mx, 44, 16, 16, player.x, player.y, player.width, player.height);
    }
    ctx.restore();

    ctx.restore();
}

function gameLoop() {
    frameCount++;
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

tilesImg.onload = marioImg.onload = () => {
    gameLoop();
};

window.addEventListener('keydown', e => {
    if (e.code === 'KeyR' && !player.alive) {
        location.reload();
    }
});
