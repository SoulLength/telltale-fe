type SpeechRecognition = any;

export class SttManager {
    private static stt: SpeechRecognition = null;

    public static startListening(lang: string, updateFn: (text: string) => void, endFn: () => void): boolean {
        const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition.");
            return false;
        }

        this.stt = new SpeechRecognition();
        this.stt.lang = lang;
        this.stt.interimResults = true;
        this.stt.continuous = true;
    
        this.stt.onresult = ({ results }: any) => {
            let transcript = "";
            for (let i = 0; i < results.length; i++) {
                transcript += results[i][0].transcript;
            }
            updateFn(transcript);
        };
    
        this.stt.onend = endFn;
    
        this.stt.onerror = ({ error }: any) => {
            endFn();
            console.error("STT error:", error);
            if (error === "not-allowed") alert("Allow microphone access to use Speech Recognition.");
        };
        
        this.stt.start();
        return true;
    }

    public static stopListening() {
        if (this.stt) {
            this.stt.stop();
            this.stt = null;
        }
    }

    public static isListening(): boolean {
        return this.stt !== null;
    }
}