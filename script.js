let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0;

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

function createWhiteNoise() {
    const bufferSize = audioContext.sampleRate * 0.1; // Short noise burst
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    return whiteNoise;
}

function playClick() {
    if (!audioContext) return;

    // High-frequency click sound with white noise for drumstick effect
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, nextNoteTime); 

    const noise = createWhiteNoise();
    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;

    // Envelope settings for both oscillator and noise burst
    envelope.gain.setValueAtTime(0, nextNoteTime);
    envelope.gain.linearRampToValueAtTime(1, nextNoteTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);

    osc.connect(envelope);
    noise.connect(noiseGain);
    noiseGain.connect(envelope);
    envelope.connect(audioContext.destination);

    osc.start(nextNoteTime);
    osc.stop(nextNoteTime + 0.1);
    noise.start(nextNoteTime);
    noise.stop(nextNoteTime + 0.1);
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
    beatCounter = 0;
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime + 0.1;
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