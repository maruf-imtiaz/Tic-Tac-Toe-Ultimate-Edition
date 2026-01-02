let gameInstance;
let p1Name = "Player 1", p2Name = "AI Master";
let gameMode = 'cpu', gameActive = false, aiLevel = 'hard';
let soundEnabled = true;

// --- ১০০% ওয়ার্কিং ডিরেক্ট অডিও লিঙ্কস ---
const sounds = {
    key: new Audio('https://www.soundjay.com/communication/typewriter-key-1.mp3'),
    tap: new Audio('https://www.soundjay.com/buttons/button-16.mp3'), 
    win: new Audio('https://www.soundjay.com/human/applause-01.mp3'), 
    lose: new Audio('https://www.soundjay.com/buttons/button-11.mp3'), 
    draw: new Audio('https://www.soundjay.com/buttons/button-10.mp3'), 
    pop: new Audio('https://www.soundjay.com/buttons/button-3.mp3'),
    bgMusic: new Audio('https://www.soundjay.com/free-music/midnight-ride-01a.mp3') 
};

// Background Music settings
sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.3;

// অডিও আনলক করার জন্য রিফাইনড ফাংশন
function unlockAudio() {
    if (soundEnabled) {
        // মিউজিক প্লে করার চেষ্টা
        let playPromise = sounds.bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented. Music will start on next click.");
            });
        }
    }
}

function playInstantSound(name) {
    if (soundEnabled && sounds[name]) {
        let soundClone = sounds[name].cloneNode(); 
        soundClone.play().catch(e => console.log("Sound play blocked"));
    }
}

function toggleSoundState() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-btn');
    btn.innerText = soundEnabled ? "ON" : "OFF";
    btn.style.background = soundEnabled ? "#4e54c8" : "#e94560";
    
    if (soundEnabled) {
        sounds.bgMusic.play().catch(e => console.log("Music play blocked"));
    } else {
        sounds.bgMusic.pause();
    }
    playInstantSound('pop');
}

function showAbout() {
    playInstantSound('pop');
    Swal.fire({
        title: 'Tic Tac Toe: Ultimate Edition',
        html: `
            <style>
                .about-container {
                    text-align: left;
                    font-size: 0.85rem;
                    line-height: 1.4;
                    color: #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .about-card {
                    background: #36364d;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid #4e54c8;
                    transition: all 0.3s ease;
                    cursor: default;
                }
                .about-card:hover {
                    background: #3e3e5e;
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(78, 84, 200, 0.4);
                    border-color: #00ffcc;
                }
                .about-card strong {
                    color: #00ffcc;
                    display: block;
                    margin-bottom: 5px;
                    font-size: 0.95rem;
                }
                .about-card p {
                    margin: 0;
                }
            </style>
            <div class="about-container">
                <div class="about-card">
                    <strong>🚀 Overview</strong>
                    <p>A modern, high-performance take on the classic Tic Tac Toe, featuring a sleek cyberpunk aesthetic and seamless gameplay.</p>
                </div>

                <div class="about-card">
                    <strong>👥 Development Team (Phantom Coders)</strong>
                    <p>• Maruf Imtiaz Pial &nbsp; • GM Yasir Arafat Badsha<br>
                       • Abdullah Nur Tayef &nbsp; • Imtiar Shamim</p>
                </div>

                <div class="about-card">
                    <strong>🎮 Key Features</strong>
                    <p>• Smart AI & PvP Modes<br>• Easy, Medium, Hard Levels<br>• Immersive SFX & Music</p>
                </div>

                <div class="about-card">
                    <strong>🧠 AI Technology</strong>
                    <p>Powered by a high-performance <b>C++ Game Engine</b> via WebAssembly. Hard mode uses <b>Minimax Algorithm</b> for unbeatable logic.</p>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Back',
        confirmButtonColor: '#4e54c8',
        background: '#2b2b3d',
        color: '#fff',
        width: '450px'
    });
}

var Module = {
    onRuntimeInitialized: function() {
        try {
            gameInstance = new Module.TicTacToe();
            console.log("C++ Engine Ready!");
        } catch(e) {
            console.error("Engine failed to start:", e);
        }
    }
};

function showInputScreen(selectedMode) {
    // ইউজার যখনই 'PVP' বা 'CPU' বাটনে ক্লিক করবে, মিউজিক শুরু হবে
    unlockAudio();
    
    playInstantSound('pop');
    gameMode = selectedMode;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('input-screen').classList.remove('hidden');
    
    const p2Input = document.getElementById('p2-name');
    const diffSelector = document.getElementById('difficulty-selector');
    
    if (gameMode === 'cpu') {
        p2Input.style.display = 'none';
        diffSelector.style.display = 'block';
    } else {
        p2Input.style.display = 'block';
        diffSelector.style.display = 'none';
    }
}

function startGame() {
    if (!gameInstance) {
        Swal.fire('Error', 'Game engine is still loading.', 'error');
        return;
    }
    
    // গেম শুরু করার সময়ও একবার মিউজিক প্লে চেক করা
    if (soundEnabled && sounds.bgMusic.paused) {
        sounds.bgMusic.play();
    }
    
    playInstantSound('pop');
    p1Name = document.getElementById('p1-name').value || "Player 1";
    aiLevel = document.getElementById('ai-difficulty').value;
    p2Name = (gameMode === 'cpu') ? "AI Master" : (document.getElementById('p2-name').value || "Player 2");

    document.getElementById('p1-display').innerText = `${p1Name}: X`;
    document.getElementById('p2-display').innerText = `${p2Name}: O`;
    document.getElementById('input-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    gameInstance.reset();
    gameActive = true;
    updateStatusUI();
}

function updateStatusUI() {
    if(!gameInstance) return;
    let turn = String.fromCharCode(gameInstance.getCurrentPlayer());
    document.getElementById('p1-display').classList.toggle('active', turn === 'X');
    document.getElementById('p2-display').classList.toggle('active', turn === 'O');
}

document.addEventListener('input', (e) => {
    if(e.target.tagName === 'INPUT') playInstantSound('key');
});

function toggleSettings() {
    playInstantSound('pop');
    document.getElementById('settings-modal').classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cell')) {
        const cell = e.target;
        if (!gameActive || cell.innerText !== "" || !gameInstance) return;

        playInstantSound('tap');

        let idx = parseInt(cell.getAttribute('data-index'));
        let symbol = String.fromCharCode(gameInstance.getCurrentPlayer());
        let result = gameInstance.makeMove(idx);

        if (result !== "invalid") {
            cell.innerText = symbol;
            cell.style.color = (symbol === 'X') ? '#ffcc00' : '#00ffcc';
            
            if (checkGameOver(result)) return;

            if (gameMode === 'cpu') {
                gameActive = false;
                updateStatusUI();
                setTimeout(aiTurn, 600);
            } else {
                updateStatusUI();
            }
        }
    }
});

function aiTurn() {
    if (!gameActive && gameMode === 'cpu' && gameInstance) {
        let aiIdx = gameInstance.getMoveByLevel(aiLevel);
        let aiSymbol = String.fromCharCode(gameInstance.getCurrentPlayer());
        let aiRes = gameInstance.makeMove(aiIdx);
        
        playInstantSound('tap');
        
        let aiCell = document.querySelector(`.cell[data-index="${aiIdx}"]`);
        if(aiCell) {
            aiCell.innerText = aiSymbol;
            aiCell.style.color = '#00ffcc';
        }
        
        gameActive = true;
        if (!checkGameOver(aiRes)) updateStatusUI();
    }
}

function checkGameOver(res) {
    if (res === "continue") return false;
    gameActive = false;
    
    let resultMsg = "";
    let iconType = "success";

    if (res === "draw") {
        playInstantSound('draw');
        resultMsg = "It's a Draw!";
        iconType = "info";
    } else {
        let winner = (res.includes('X')) ? p1Name : p2Name;
        resultMsg = winner + " Wins!";

        if (gameMode === 'cpu' && res.includes('O')) {
            playInstantSound('lose'); 
            iconType = "error";
        } else {
            playInstantSound('win'); 
            iconType = "success";
        }
    }

    setTimeout(() => {
        Swal.fire({
            title: 'Game Over',
            text: resultMsg,
            icon: iconType,
            background: '#2b2b3d',
            color: '#fff',
            confirmButtonColor: '#4e54c8'
        }).then(() => location.reload());
    }, 700);
    return true;
}