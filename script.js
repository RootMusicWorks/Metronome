let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let isFirstClick = true;
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

function playClick() {
    if (!audioContext) return; // Ensure the context is initialized
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.frequency.value = 1000;
    envelope.gain.value = isFirstClick ? 1 : 0.7; // Adjust the first click to be louder
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(nextNoteTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.stop(nextNoteTime + 0.1);
    isFirstClick = false; // Reset after the first beat
}

function scheduler() {
    while (nextNoteTime < audioContext.currentTime + 0.1) {
        playClick();
        nextNoteTime += 60.0 / tempo;
    }
    if (isPlaying) {
        requestAnimationFrame(scheduler);
    }
}

async function toggleMetronome() {
    initializeAudioContext();
    isFirstClick = true; // Ensure the first click is adjusted on each start
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime;
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
