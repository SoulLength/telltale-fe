export async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export const recordingStartAudio = new Audio("/recording_start.mp3");
recordingStartAudio.volume = 0.01;


export const audioContext = new AudioContext();
export const gainNode = audioContext.createGain();
gainNode.gain.value = 4.0;
gainNode.connect(audioContext.destination);