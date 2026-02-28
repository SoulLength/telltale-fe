const TRANSCRIBE_URL = import.meta.env.VITE_TELLTALE_API_URL + "/api/v1/transcribe";

export class SttManager {
    private static recorder: MediaRecorder | null = null;
    private static chunks: Blob[] = [];

    public static startListening() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            this.chunks = [];
            this.recorder = new MediaRecorder(stream);
            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };
            this.recorder.start();
        }).catch((err) => {
            console.error("Microphone access denied:", err);
            alert("Allow microphone access to use Speech Recognition.");
        });
    }

    public static stopListening(lang: string): Promise<string | null> {
        return new Promise((resolve) => {
            if (!this.recorder || this.recorder.state === "inactive") {
                resolve(null);
                return;
            }

            this.recorder.onstop = async () => {
                const blob = new Blob(this.chunks, { type: "audio/webm" });
                try {
                    const formData = new FormData();
                    formData.append("file", blob, "recording.webm");
                    formData.append("lang", lang);
                    const res = await fetch(TRANSCRIBE_URL, { method: "POST", body: formData });
                    const { transcript } = await res.json();
                    resolve(transcript ? transcript.charAt(0).toUpperCase() + transcript.slice(1) : null);
                } catch (err) {
                    console.error("Whisper transcription failed:", err);
                    resolve(null);
                }
            };

            this.recorder.stop();
            this.recorder = null;
        });
    }

    public static isListening(): boolean {
        return this.recorder !== null;
    }
}