let gameInstance;
let p1Name = "Player 1", p2Name = "AI Master";
let gameMode = 'cpu', gameActive = false, aiLevel = 'hard';
let soundEnabled = true;

// --- অডিও কনফিগারেশন ---
const sounds = {
    key: new Audio('typewriter-key-1.mp3'),
    tap: new Audio('screen-tap-38717.mp3'), 
    win: new Audio('applause-01.mp3'), 
    lose: new Audio('button-11.mp3'), 
    draw: new Audio('button-10.mp3'), 
    pop: new Audio('button-3.mp3'),
    bgMusic: new Audio('midnight-ride-01a.mp3') 
};

sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.3;

function unlockAudio() {
    if (soundEnabled) {
        let playPromise = sounds.bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Autoplay prevented"));
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
    if (soundEnabled) sounds.bgMusic.play();
    else sounds.bgMusic.pause();
    playInstantSound('pop');
}

function showAbout() {
    playInstantSound('pop');
    Swal.fire({
        title: 'Tic Tac Toe: Ultimate Edition',
        html: `<div style="text-align:left; color:#eee;">🚀 Modern Tic Tac Toe with C++ Engine logic. Developed by Phantom Coders.</div>`,
        confirmButtonText: 'Back',
        confirmButtonColor: '#4e54c8',
        background: '#2b2b3d',
        color: '#fff'
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
    
    let resultTitle = "";
    let resultMsg = "";
    let iconType = "success";

    if (res === "draw") {
        playInstantSound('draw');
        resultTitle = "Draw!";
        resultMsg = "It's a tie!";
        iconType = "info";
    } else {
        let winnerSymbol = res.includes('X') ? 'X' : 'O';
        let winnerName = (winnerSymbol === 'X') ? p1Name : p2Name;

        if (gameMode === 'cpu') {
            if (winnerSymbol === 'X') {
                playInstantSound('win');
                resultTitle = "Victory!";
                resultMsg = `${winnerName} Win!`; 
                iconType = "success";
            } else {
                playInstantSound('lose');
                resultTitle = "Defeat!";
                resultMsg = "CPU Win!"; 
                iconType = "error";
            }
        } else {
            playInstantSound('win');
            resultTitle = "Winner!";
            resultMsg = `${winnerName} Win!`;
            iconType = "success";
        }
    }

    setTimeout(() => {
        Swal.fire({
            title: resultTitle,
            text: resultMsg,
            icon: iconType,
            background: '#2b2b3d',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Restart',
            cancelButtonText: 'Back',
            confirmButtonColor: '#4e54c8',
            cancelButtonColor: '#666',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Restart Logic
                gameInstance.reset();
                document.querySelectorAll('.cell').forEach(cell => {
                    cell.innerText = "";
                    cell.style.color = "";
                });
                gameActive = true;
                updateStatusUI();
            } else {
                // Back Logic
                location.reload();
            }
        });
    }, 700);
    return true;
}