const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const countdownDisplay = document.getElementById("countdown");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const pauseControls = document.getElementById("pauseControls");
const clickSound = document.getElementById("clickSound");
const timeSelectionDiv = document.getElementById("timeSelection");

let score = 0;
let timeLeft = 30;
let selectedTime = 30; // Default time
let gameInterval;
let spawnInterval;
let spawnRate = 800;
let isPaused = false;

// Create time selection dropdown
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
            ${timeOptions.map(option => 
                `<option value="${option.value}" ${option.value === 30 ? 'selected' : ''}>
                    ${option.label}
                </option>`
            ).join('')}
        </select>
    `;
    
    const select = timeSelectionDiv.querySelector('#timeSelect');
    select.onchange = (e) => {
        selectedTime = parseInt(e.target.value);
        timeDisplay.textContent = selectedTime;
        timeSelectionDiv.style.display = 'none';
    };

    // Prevent dropdown clicks from bubbling up
    timeSelectionDiv.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Initialize the dropdown
createTimeDropdown();

// Add click handler for time display
timeDisplay.parentElement.addEventListener('click', (e) => {
    if (!isPaused && !gameInterval && !gameOverScreen.style.display.includes('block')) {  // Only allow changes before game starts and when not in game over
        e.stopPropagation();
        timeSelectionDiv.style.display = timeSelectionDiv.style.display === 'none' ? 'block' : 'none';
    }
});

// Hide dropdown when clicking outside
document.addEventListener('click', () => {
    if (timeSelectionDiv.style.display === 'block') {
        timeSelectionDiv.style.display = 'none';
    }
});

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

function spawnCircle() {
  if (isPaused) return;

  const circle = document.createElement("div");
  const size = Math.random() * 40 + 20;
  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);

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
}

function startGame() {
  score = 0;
  timeLeft = selectedTime;
  spawnRate = 800;
  isPaused = false;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameArea.innerHTML = "";
  gameOverScreen.style.display = "none";
  pauseControls.style.display = "none";
  timeSelectionDiv.style.display = "none";

  gameInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);

  spawnInterval = setInterval(spawnCircle, spawnRate);

  // Change Start to Stop
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
  gameArea.innerHTML = "";
  gameOverScreen.style.display = "block";
  finalScore.textContent = score;
  startBtn.textContent = "Start Game";
  startBtn.onclick = startCountdown;
  startBtn.style.display = "inline-block";
}

function startCountdown() {
  let count = 3;
  countdownDisplay.style.display = "block";
  countdownDisplay.textContent = count;

  // Disable start button during countdown
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
      // Re-enable start button after countdown
      startBtn.disabled = false;
      startGame();
    }
  }, 1000);
}

window.addEventListener("resize", () => {
  gameArea.style.width = "100%";
  gameArea.style.height = "100vh";
});
