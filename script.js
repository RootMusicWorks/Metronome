let audioContext = null;
let nextNoteTime = 0.0;
let tempo = 120;
let isPlaying = false;
let bpmInput = document.getElementById("bpmInput");
let beatCounter = 0; // To track the first beat

bpmInput.addEventListener("input", () => {
    tempo = parseInt(bpmInput.value);
});

function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            // Insert a silent pulse to stabilize the audio context
            const silence = audioContext.createOscillator();
            const silentGain = audioContext.createGain();
            silentGain.gain.value = 0;
            silence.connect(silentGain);
            silentGain.connect(audioContext.destination);
            silence.start();
            silence.stop(audioContext.currentTime + 0.01);
        });
    }
}

function playClick() {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    
    // More precise gain control for the first beat volume
    osc.frequency.value = 1000;
    envelope.gain.setValueAtTime(0, nextNoteTime); // Start from zero volume
    envelope.gain.linearRampToValueAtTime(beatCounter === 0 ? 1 : 0.7, nextNoteTime + 0.01); 
    envelope.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.1);
    
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    
    osc.start(nextNoteTime);
    osc.stop(nextNoteTime + 0.1);
    beatCounter++;
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
    beatCounter = 0; // Reset beat counter for proper volume control
    if (!isPlaying) {
        nextNoteTime = audioContext.currentTime + 0.1; // Slight delay for audio stability
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