const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const buttons = document.querySelectorAll('[data-shot]');

const game = {
  playerGoals: 0,
  keeperGoals: 0,
  shooting: false,
};

const ball = {
  x: 120,
  y: canvas.height / 2,
  radius: 12,
  active: false,
  vx: 0,
  vy: 0,
};

const keeper = {
  x: 710,
  y: canvas.height / 2,
  radius: 36,
  targetX: 710,
  targetY: canvas.height / 2,
};

const goalArea = {
  left: canvas.width - 18,
  top: 110,
  bottom: 410,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScore() {
  scoreEl.textContent = `${game.playerGoals} x ${game.keeperGoals}`;
}

function resetBall() {
  ball.x = 120;
  ball.y = canvas.height / 2;
  ball.active = false;
  ball.vx = 0;
  ball.vy = 0;
}

function resetKeeper() {
  keeper.x = 710;
  keeper.y = canvas.height / 2;
  keeper.targetX = 710;
  keeper.targetY = canvas.height / 2;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function shootTo(direction) {
  if (game.shooting) {
    return;
  }

  const targetY = {
    left: 145,
    center: canvas.height / 2,
    right: 375,
  }[direction];

  const startX = 120;
  const startY = canvas.height / 2;
  const endX = canvas.width - 28;
  const endY = targetY;

  const angle = Math.atan2(endY - startY, endX - startX);
  const speed = 12;

  ball.x = startX;
  ball.y = startY;
  ball.active = true;
  ball.vx = Math.cos(angle) * speed;
  ball.vy = Math.sin(angle) * speed;

  keeper.targetX = clamp(660 + Math.random() * 100, 620, 760);
  keeper.targetY = clamp(targetY + (Math.random() * 120 - 60), 120, 400);

  game.shooting = true;
  setStatus('Bola em movimento!');
}

function finishRound(saved) {
  if (saved) {
    game.keeperGoals += 1;
    setStatus('Defesa do goleiro!');
  } else {
    game.playerGoals += 1;
    setStatus('GOL!!!');
  }

  updateScore();
  game.shooting = false;
  setTimeout(() => {
    resetBall();
    resetKeeper();
    setStatus('Escolha um canto para bater');
  }, 1200);
}

function updateKeeper() {
  const desiredX = clamp(ball.active ? 730 - (ball.x - 150) * 0.4 : 710, 620, 760);
  const desiredY = clamp(ball.active ? ball.y : canvas.height / 2, 120, 400);

  keeper.targetX = desiredX;
  keeper.targetY = desiredY;

  keeper.x += (keeper.targetX - keeper.x) * 0.22;
  keeper.y += (keeper.targetY - keeper.y) * 0.22;
}

function updateBall() {
  if (!ball.active) {
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y < 50 || ball.y > canvas.height - 50) {
    ball.vy *= -1;
  }

  const reachedGoalLine = ball.x >= goalArea.left;
  const isSaved =
    Math.abs(ball.x - keeper.x) < 40 &&
    Math.abs(ball.y - keeper.y) < 45 &&
    ball.x > 610;

  if (isSaved) {
    ball.active = false;
    finishRound(true);
    return;
  }

  if (reachedGoalLine) {
    ball.active = false;
    finishRound(false);
  }
}

function drawField() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // campo
  ctx.fillStyle = '#1d8f4d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // linhas
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 32, canvas.width - 80, canvas.height - 64);

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 32);
  ctx.lineTo(canvas.width / 2, canvas.height - 32);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(40, 130, 110, 260);
  ctx.strokeRect(canvas.width - 150, 130, 110, 260);

  ctx.beginPath();
  ctx.moveTo(40, 32);
  ctx.lineTo(canvas.width - 40, 32);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, canvas.height - 32);
  ctx.lineTo(canvas.width - 40, canvas.height - 32);
  ctx.stroke();

  // gol
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.strokeRect(canvas.width - 35, 110, 20, 300);
}

function drawKeeper() {
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(keeper.x, keeper.y, keeper.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(keeper.x - 16, keeper.y - 12, 32, 24);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(keeper.x - 18, keeper.y - 52, 36, 12);
}

function drawBall() {
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMarker() {
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(120, canvas.height / 2, 8, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  updateKeeper();
  updateBall();

  drawField();
  drawMarker();
  drawKeeper();
  drawBall();

  requestAnimationFrame(gameLoop);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.dataset.shot;
    shootTo(direction);
  });
});

document.addEventListener('keydown', (event) => {
  const keyMap = {
    a: 'left',
    s: 'center',
    d: 'right',
  };

  const direction = keyMap[event.key.toLowerCase()];
  if (direction) {
    shootTo(direction);
  }
});

updateScore();
resetBall();
resetKeeper();
requestAnimationFrame(gameLoop);
