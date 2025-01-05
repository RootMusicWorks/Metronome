let audioContext;
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
}

function playClick() {
    if (!audioContext) return; // Ensure the context is ready
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.frequency.value = 1000;
    envelope.gain.value = 1;
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(nextNoteTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    osc.stop(nextNoteTime + 0.1);
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
    if (audioContext.state === 'suspended') {
        await audioContext.resume(); // Activate sound context
    }
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