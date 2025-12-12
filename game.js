const canvas = document.getElementById("gameCanvas");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const ctx = canvas.getContext("2d");
const box = 20;
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const lengthEl = document.getElementById("length");
const bestScoreEl = document.getElementById("bestScore");
const bestLengthEl = document.getElementById("bestLength");
const bestMovesEl = document.getElementById("bestMoves");
const bestTimeEl = document.getElementById("bestTime");

let isPaused = false;
let isGameOver = false;
let dx = box;
let dy = 0;
let score = 0;
let moves = 0;
let startTime = Date.now();
let timeInterval;
let lastDirection = { dx: box, dy: 0 };
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
let bestLength = Number(localStorage.getItem("bestLength")) || 3;
let bestMoves = Number(localStorage.getItem("bestMoves")) || 0;
let bestTime = Number(localStorage.getItem("bestTime")) || 0;
let nextDirection = { dx: box, dy: 0 };
let directionChanged = false;

bestScoreEl.textContent = bestScore;
bestLengthEl.textContent = bestLength;
bestMovesEl.textContent = bestMoves;
bestTimeEl.textContent = bestTime + "s";

let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];

function generateFood() {
    let newFood;
    let isOnSnake;
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    return newFood;
}

let food = generateFood();

function drawSnake() {
    snake.forEach((part) => {
        ctx.fillStyle = "lime";
        ctx.fillRect(part.x, part.y, box, box);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
}

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoopId);
    clearInterval(timeInterval);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    let isNewBest = false;
    if (score > bestScore) {
        isNewBest = true;
    } else if (score === bestScore && bestScore > 0) {
        if (moves < bestMoves) {
            isNewBest = true;
        } else if (moves === bestMoves && finalTime < bestTime) {
            isNewBest = true;
        }
    }
    if (isNewBest) {
        bestScore = score;
        bestLength = snake.length;
        bestMoves = moves;
        bestTime = finalTime;

        localStorage.setItem("bestScore", bestScore);
        localStorage.setItem("bestLength", bestLength);
        localStorage.setItem("bestMoves", bestMoves);
        localStorage.setItem("bestTime", bestTime);

        bestScoreEl.textContent = bestScore;
        bestLengthEl.textContent = bestLength;
        bestMovesEl.textContent = bestMoves;
        bestTimeEl.textContent = bestTime + "s";
    }
    drawOverlay();
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

function drawOverlay() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (isPaused || isGameOver) return;
    dx = nextDirection.dx;
    dy = nextDirection.dy;
    directionChanged = false;
    moveSnake();
    let head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
        return;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endGame();
            return;
        }
    }
    clearCanvas();
    drawFood();
    drawSnake();
}

function changeDirection(event) {
    if (isPaused || isGameOver) return;
    if (directionChanged) return;
    const key = event.key;
    const goingUp = dy === -box;
    const goingDown = dy === box;
    const goingLeft = dx === -box;
    const goingRight = dx === box;
    let newDx = nextDirection.dx;
    let newDy = nextDirection.dy;
    if (key === "ArrowUp" && !goingDown) { newDx = 0; newDy = -box; }
    if (key === "ArrowDown" && !goingUp) { newDx = 0; newDy = box; }
    if (key === "ArrowLeft" && !goingRight) { newDx = -box; newDy = 0; }
    if (key === "ArrowRight" && !goingLeft) { newDx = box; newDy = 0; }
    if (newDx === nextDirection.dx && newDy === nextDirection.dy) return;
    const changedAxis =
        (lastDirection.dx !== newDx) || (lastDirection.dy !== newDy);

    if (changedAxis) {
        moves++;
        movesEl.textContent = moves;
    }
    nextDirection = { dx: newDx, dy: newDy };
    lastDirection = { dx: newDx, dy: newDy };
    directionChanged = true;
}

function updateTime() {
    if (isPaused || isGameOver) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeEl.textContent = elapsed + "s";
}

function moveSnake() {
    const newHead = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        scoreEl.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
    snake.unshift(newHead);
    lengthEl.textContent = snake.length;
}

function resetGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    dx = box;
    dy = 0;
    nextDirection = { dx: box, dy: 0 };
    lastDirection = { dx: box, dy: 0 };
    directionChanged = false;
    food = generateFood();
    clearCanvas();
    clearInterval(gameLoopId);
    isGameOver = false;
    score = 0;
    moves = 0;
    startTime = Date.now();
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    timeEl.textContent = "0s";
    lengthEl.textContent = snake.length;
    clearInterval(timeInterval);
    timeInterval = setInterval(updateTime, 1000);
    gameLoopId = setInterval(gameLoop, 200);
    isPaused = false;
    pauseBtn.textContent = "Pause";
}

function togglePause() {
    if (isGameOver) return;
    if (!isPaused) {
        clearInterval(gameLoopId);
        clearInterval(timeInterval);
        pauseBtn.textContent = "Continue";
        isPaused = true;
    } else {
        gameLoopId = setInterval(gameLoop, 200);
        timeInterval = setInterval(updateTime, 1000);
        pauseBtn.textContent = "Pause";
        isPaused = false;
    }
}

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.style.display = "block";
let gameLoopId = setInterval(gameLoop, 200);
timeInterval = setInterval(updateTime, 1000);