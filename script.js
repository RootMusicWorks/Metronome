let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playClick(isFirstBeat = false) {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    
    // First beat volume controlled separately for balance
    osc.frequency.value = 1000;
    envelope.gain.value = isFirstBeat ? 0.8 : 0.7;
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    
    osc.start(nextNoteTime);
    envelope.gain.setValueAtTime(envelope.gain.value, nextNoteTime); 
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.stop(nextNoteTime + 0.1);
}

function scheduler() {
    let isFirstBeat = nextNoteTime === audioContext.currentTime;
    while (nextNoteTime < audioContext.currentTime + 0.1) {
        playClick(isFirstBeat);
        nextNoteTime += 60.0 / tempo;
        isFirstBeat = false;
    }
    if (isPlaying) {
        requestAnimationFrame(scheduler);
    }
}

async function toggleMetronome() {
    initializeAudioContext();
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime + 0.05; // Small delay for stability
        isPlaying = true;
        scheduler();
    } else {
        isPlaying = false;
    }
}

function adjustBPM(change) {
    tempo += change;
    bpmInput.value = tempo;
}