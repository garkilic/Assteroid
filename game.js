const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const challengeText = document.getElementById('challengeText');
const challengeInput = document.getElementById('challengeInput');
const typingChallenge = document.getElementById('typingChallenge');
const spinnerChallenge = document.getElementById('spinnerChallenge');
const spinnerNumber = document.querySelector('.spinner-number');
const spinButton = document.getElementById('spinButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const resetButton = document.getElementById('resetButton');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Mobile controls
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let score = 0;
let gameOver = false;
let gameStarted = false;
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    velocity: { x: 0, y: 0 },
    radius: 15,
    lives: 3,
    speed: 5 // Increased speed for better responsiveness
};

const bullets = [];
const asteroids = [];
const keys = {};
let lastChallengeTime = 0;
let lastScoreTime = Date.now();
let isTypingChallengeActive = false;
let isSpinnerChallengeActive = false;
let currentSpinnerValue = 0;
const challengePhrases = [
    "Get good noob",
    "Skill issue",
    "Git gud scrub",
    "Try harder",
    "You suck",
    "L2P",
    "Noob alert",
    "GG EZ",
    "Uninstall",
    "Practice more"
];

// Mobile control event listeners
function setupMobileControls() {
    const mobileButtons = [upBtn, downBtn, leftBtn, rightBtn];
    
    mobileButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[btn.textContent] = true;
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[btn.textContent] = false;
        });

        // Add mouse events for desktop testing
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            keys[btn.textContent] = true;
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            keys[btn.textContent] = false;
        });

        // Handle mouse leave to prevent stuck keys
        btn.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            keys[btn.textContent] = false;
        });
    });
}

// Reset game function
function resetGame() {
    score = 0;
    gameOver = false;
    ship.lives = 3;
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.velocity = { x: 0, y: 0 };
    bullets.length = 0;
    asteroids.length = 0;
    lastChallengeTime = Date.now();
    lastScoreTime = Date.now();
    isTypingChallengeActive = false;
    isSpinnerChallengeActive = false;
    typingChallenge.style.display = 'none';
    spinnerChallenge.style.display = 'none';
    gameOverScreen.style.display = 'none';
    scoreElement.textContent = score;
    livesElement.textContent = ship.lives;
    
    // Create initial asteroids
    for (let i = 0; i < 3; i++) {
        createAsteroid();
    }
}

// Create asteroids
function createAsteroid() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: // top
            x = Math.random() * canvas.width;
            y = -20;
            break;
        case 1: // right
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
        case 2: // bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
        case 3: // left
            x = -20;
            y = Math.random() * canvas.height;
            break;
    }
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1; // Slower asteroids
    
    asteroids.push({
        x,
        y,
        velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        },
        radius: 20 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05
    });
}

// Show typing challenge
function showTypingChallenge() {
    if (isTypingChallengeActive || isSpinnerChallengeActive) return;
    isTypingChallengeActive = true;
    const randomPhrase = challengePhrases[Math.floor(Math.random() * challengePhrases.length)];
    challengeText.textContent = randomPhrase;
    challengeInput.value = '';
    typingChallenge.style.display = 'block';
    challengeInput.focus();
}

// Show spinner challenge
function showSpinnerChallenge() {
    if (isTypingChallengeActive || isSpinnerChallengeActive) return;
    isSpinnerChallengeActive = true;
    currentSpinnerValue = 0;
    spinnerNumber.textContent = currentSpinnerValue;
    spinnerChallenge.style.display = 'block';
}

// Spin the spinner
function spin() {
    const spins = 5 + Math.floor(Math.random() * 5);
    const finalValue = 1 + Math.floor(Math.random() * 5); // Random number between 1 and 5
    let currentSpin = 0;
    
    const spinInterval = setInterval(() => {
        currentSpinnerValue = (currentSpinnerValue % 5) + 1; // Cycle through 1-5
        spinnerNumber.textContent = currentSpinnerValue;
        currentSpin++;
        
        if (currentSpin >= spins) {
            clearInterval(spinInterval);
            currentSpinnerValue = finalValue;
            spinnerNumber.textContent = currentSpinnerValue;
            
            if (currentSpinnerValue === 3) {
                spinnerChallenge.style.display = 'none';
                isSpinnerChallengeActive = false;
                lastChallengeTime = Date.now();
                createAsteroid();
                createAsteroid();
                score += 100;
                scoreElement.textContent = score;
            }
        }
    }, 100);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (isTypingChallengeActive || isSpinnerChallengeActive) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        return;
    }
    keys[e.key] = true;
    if (e.key === ' ') {
        shoot();
    }
});

window.addEventListener('keyup', (e) => {
    if (!isTypingChallengeActive && !isSpinnerChallengeActive) {
        keys[e.key] = false;
    }
});

spinButton.addEventListener('click', spin);
resetButton.addEventListener('click', resetGame);

challengeInput.addEventListener('input', () => {
    if (challengeInput.value === challengeText.textContent) {
        typingChallenge.style.display = 'none';
        isTypingChallengeActive = false;
        lastChallengeTime = Date.now();
        createAsteroid();
        createAsteroid();
        score += 100;
        scoreElement.textContent = score;
    }
});

// Shoot function
function shoot() {
    bullets.push({
        x: ship.x,
        y: ship.y,
        angle: Math.atan2(mouseY - ship.y, mouseX - ship.x),
        speed: 5,
        life: 100
    });
}

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Check if device is mobile
function isMobileDevice() {
    return (window.innerWidth <= 768) || ('ontouchstart' in window);
}

// Start game function
function startGame() {
    gameStarted = true;
    startScreen.style.display = 'none';
    
    // Show all game elements
    canvas.style.display = 'block';
    document.querySelector('.controls-info').style.display = 'block';
    
    // Only show mobile controls on mobile devices
    if (isMobileDevice()) {
        document.querySelector('.mobile-controls').style.display = 'block';
    } else {
        document.querySelector('.mobile-controls').style.display = 'none';
    }
    
    // Reset and start the game
    resetGame();
    gameLoop();
}

// Update game state
function update() {
    if (!gameStarted || gameOver) {
        if (gameOver) {
            gameOverScreen.style.display = 'block';
            finalScoreElement.textContent = score;
        }
        return;
    }
    
    // Increment score over time
    const currentTime = Date.now();
    if (currentTime - lastScoreTime > 100) {
        score += 1;
        scoreElement.textContent = score;
        lastScoreTime = currentTime;
    }
    
    // Check for challenges
    if (!isTypingChallengeActive && !isSpinnerChallengeActive && 
        currentTime - lastChallengeTime > 5000 + Math.random() * 2000) {
        if (Math.random() < 0.5) {
            showTypingChallenge();
        } else {
            showSpinnerChallenge();
        }
        asteroids.forEach(asteroid => {
            asteroid.velocity.x *= 1.5;
            asteroid.velocity.y *= 1.5;
        });
    }
    
    // Ship controls - more responsive
    if (!isTypingChallengeActive && !isSpinnerChallengeActive) {
        const speed = ship.speed;
        
        // Reset velocity
        ship.velocity.x = 0;
        ship.velocity.y = 0;
        
        // Apply movement based on active keys
        if (keys['↑'] || keys['ArrowUp']) {
            ship.velocity.y = -speed;
        }
        if (keys['↓'] || keys['ArrowDown']) {
            ship.velocity.y = speed;
        }
        if (keys['←'] || keys['ArrowLeft']) {
            ship.velocity.x = -speed;
        }
        if (keys['→'] || keys['ArrowRight']) {
            ship.velocity.x = speed;
        }
        
        // Normalize diagonal movement
        if (ship.velocity.x !== 0 && ship.velocity.y !== 0) {
            ship.velocity.x *= 0.7071; // 1/sqrt(2)
            ship.velocity.y *= 0.7071;
        }
    }
    
    // Update ship position
    ship.x += ship.velocity.x;
    ship.y += ship.velocity.y;
    
    // Wrap around screen
    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += Math.cos(bullets[i].angle) * bullets[i].speed;
        bullets[i].y += Math.sin(bullets[i].angle) * bullets[i].speed;
        bullets[i].life--;
        
        if (bullets[i].life <= 0) {
            bullets.splice(i, 1);
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += asteroid.velocity.x;
        asteroid.y += asteroid.velocity.y;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Wrap around screen
        if (asteroid.x < -asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = -asteroid.radius;
        if (asteroid.y < -asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = -asteroid.radius;
        
        // Check collision with ship
        const dx = ship.x - asteroid.x;
        const dy = ship.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ship.radius + asteroid.radius) {
            ship.lives--;
            livesElement.textContent = ship.lives;
            if (ship.lives <= 0) {
                gameOver = true;
            } else {
                // Reset ship position and velocity
                ship.x = canvas.width / 2;
                ship.y = canvas.height / 2;
                ship.velocity = { x: 0, y: 0 };
            }
            asteroids.splice(i, 1);
        }
    }
    
    // Spawn new asteroids more frequently during typing challenge
    if (isTypingChallengeActive) {
        if (Math.random() < 0.03) {
            createAsteroid();
        }
    } else {
        if (Math.random() < 0.01) {
            createAsteroid();
        }
    }
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted || gameOver) {
        return;
    }
    
    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    const angle = Math.atan2(mouseY - ship.y, mouseX - ship.x);
    ctx.rotate(angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    // Draw bullets
    ctx.fillStyle = '#fff';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw asteroids
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = asteroid.radius * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);

// Initialize mobile controls
if (isMobileDevice()) {
    setupMobileControls();
}

// Hide canvas and game elements initially
canvas.style.display = 'none';
document.querySelector('.controls-info').style.display = 'none';
document.querySelector('.mobile-controls').style.display = 'none';
typingChallenge.style.display = 'none';
spinnerChallenge.style.display = 'none';
gameOverScreen.style.display = 'none';

// Show start screen
startScreen.style.display = 'block'; 