const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const timeDisplay = document.getElementById("time");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const finalHighScore = document.getElementById("finalHighScore");
const countdownDisplay = document.getElementById("countdown");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const pauseControls = document.getElementById("pauseControls");
const clickSound = document.getElementById("clickSound");
const timeSelectionDiv = document.getElementById("timeSelection");

let score = 0;
let timeLeft = 30;
let selectedTime = 30;
let gameInterval = null;
let spawnInterval = null;
let spawnRate = 800;
let isPaused = false;
let gameOver = false;

// High score from localStorage
let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;

const timeOptions = [
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
  { label: "20s", value: 20 },
  { label: "30s", value: 30 },
  { label: "1min", value: 60 }
];

function createTimeDropdown() {
  timeSelectionDiv.innerHTML = `
    <select id="timeSelect" class="time-select">
      ${timeOptions.map(opt => `<option value="${opt.value}" ${opt.value === 30 ? 'selected' : ''}>${opt.label}</option>`).join('')}
    </select>
  `;
  const timeSelect = timeSelectionDiv.querySelector('#timeSelect');
  timeSelect.onchange = (e) => {
    selectedTime = parseInt(e.target.value);
    timeDisplay.textContent = selectedTime;
    timeSelectionDiv.style.display = 'none';
  };
  // Prevent click inside dropdown from closing it
  timeSelectionDiv.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
createTimeDropdown();

timeDisplay.parentElement.addEventListener('click', (e) => {
  if (!isPaused && !gameInterval && !gameOverScreen.style.display.includes('block')) {
    e.stopPropagation();
    if (timeSelectionDiv.style.display === 'block') {
      timeSelectionDiv.style.display = 'none';
    } else {
      timeSelectionDiv.style.display = 'block';
      // Focus the select for better UX
      const select = timeSelectionDiv.querySelector('#timeSelect');
      if (select) select.focus();
    }
  }
});
document.addEventListener('click', () => {
  if (timeSelectionDiv.style.display === 'block') {
    timeSelectionDiv.style.display = 'none';
  }
});

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

function spawnCircle() {
  if (isPaused || gameOver) return;

  const circle = document.createElement("div");
  const size = Math.random() * 40 + 20;

  // Use getBoundingClientRect for accurate width/height
  const rect = gameArea.getBoundingClientRect();
  const maxX = Math.floor(Math.max(0, rect.width - size));
  const maxY = Math.floor(Math.max(0, rect.height - size));
  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));

  circle.classList.add("circle");
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.backgroundColor = getRandomColor();

  circle.addEventListener("click", () => {
    score++;
    scoreDisplay.textContent = score;
    clickSound.currentTime = 0;
    clickSound.play();
    circle.remove();
    updateDifficulty();
  });

  gameArea.appendChild(circle);
  setTimeout(() => circle.remove(), 1200);
}

function updateDifficulty() {
  if (score % 10 === 0 && score !== 0) {
    clearInterval(spawnInterval);
    spawnRate = Math.max(200, spawnRate - 100);
    spawnInterval = setInterval(spawnCircle, spawnRate);
  }
  if (score % 20 === 0 && score !== 0) {
    gameArea.style.backgroundColor = `hsl(${Math.random() * 360}, 30%, 15%)`;
  }
}

function startGame() {
  score = 0;
  timeLeft = selectedTime;
  spawnRate = 800;
  isPaused = false;
  gameOver = false;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameArea.innerHTML = "";
  gameOverScreen.style.display = "none";
  pauseControls.style.display = "none";
  timeSelectionDiv.style.display = "none";
  gameArea.style.backgroundColor = "#222";

  gameInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(gameInterval); // Stop the timer immediately
        gameInterval = null;
        endGame();
      }
    }
  }, 1000);

  spawnInterval = setInterval(spawnCircle, spawnRate);

  startBtn.textContent = "Stop";
  startBtn.onclick = pauseGame;
  startBtn.style.display = "inline-block";
}

function pauseGame() {
  isPaused = true;
  pauseControls.style.display = "flex";
  startBtn.style.display = "none";
}

function resumeGame() {
  isPaused = false;
  pauseControls.style.display = "none";
  startBtn.style.display = "inline-block";
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameInterval = null;
  spawnInterval = null;
  gameOver = true;
  gameArea.innerHTML = "";
  gameOverScreen.style.display = "block";
  finalScore.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  finalHighScore.textContent = highScore;
  highScoreDisplay.textContent = highScore;

  startBtn.textContent = "Start Game";
  startBtn.onclick = startCountdown;
  startBtn.style.display = "inline-block";
}

function startCountdown() {
  let count = 3;
  countdownDisplay.style.display = "block";
  countdownDisplay.textContent = count;
  startBtn.disabled = true;
  startBtn.style.display = "none";
  pauseControls.style.display = "none";
  gameOverScreen.style.display = "none";

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDisplay.textContent = count;
    } else {
      clearInterval(countdown);
      countdownDisplay.style.display = "none";
      startBtn.disabled = false;
      startGame();
    }
  }, 1000);
}

// When a circle is clicked
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('circle')) {
    // Create a new Audio instance for each click
    new Audio('sounds/pop2.mp3').play();
    // score++;
    scoreDisplay.textContent = score;
    clickSound.currentTime = 0;
    clickSound.play();
    e.target.remove();
    updateDifficulty();
  }
});

window.addEventListener("resize", () => {
  gameArea.style.width = "100%";
  gameArea.style.height = "100vh";
});
