export async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export const recordingStartAudio = new Audio("/recording_start.mp3");
recordingStartAudio.volume = 0.01;