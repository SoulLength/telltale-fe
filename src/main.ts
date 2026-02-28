import { DomManager, TranslatorSide } from "./dom-manager.js";
import { SttManager } from "./stt-manager.js";

const API_URL = import.meta.env.VITE_TELLTALE_API_URL;

type TranslateResponse = { translation: string };
type SynthesizeResponse = { base64Speech: string };

// --- API ---
async function translate(text: string, from: string, to: string): Promise<TranslateResponse> {
    const res = await fetch(`${API_URL}/api/v1/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
    });
    return res.json();
}

async function synthesize(text: string, language: string): Promise<SynthesizeResponse> {
    const res = await fetch(`${API_URL}/api/v1/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
    });
    return res.json();
}

// --- Translation flow ---
async function handleTranslation(fromSide: TranslatorSide): Promise<void> {
    const text = fromSide.textArea.value;
    if (!text.trim()) return;

    const toSide = DomManager.getOtherSides(fromSide)[0]; // Considering only two sides for now

    const fromLang = fromSide.languageSelect.value;
    const toLang = toSide.languageSelect.value;

    const { translation } = await translate(text, fromLang, toLang);
    fromSide.textArea.placeholder = text;
    toSide.textArea.placeholder = translation;
    fromSide.textArea.value = "";
    toSide.textArea.value = "";

    fromSide.sendButton.classList.remove("sending");
    DomManager.updateButton(fromSide);
    const { base64Speech } = await synthesize(translation, toLang);
    if (base64Speech) speak(base64Speech);
}

// --- Audio ---
function speak(base64: string): void {
    new Audio(`data:audio/mp3;base64,${base64}`).play();
}

[DomManager.up.textArea, DomManager.down.textArea].forEach((area) => {
    area.addEventListener("input", (event) => {
        const element = event.target as HTMLTextAreaElement;
        DomManager.updateButton(DomManager.getSide(element));
    });
});

[DomManager.up.sendButton, DomManager.down.sendButton].forEach((btn) => {
    btn.addEventListener("click", (event) => {
        const element = event.currentTarget as HTMLButtonElement;
        element.classList.add("sending");
        handleTranslation(DomManager.getSide(element));
    });
});

[DomManager.up.microphoneButton, DomManager.down.microphoneButton].forEach((btn) => {
    btn.addEventListener("click", async (event) => {
        const element = event.currentTarget as HTMLButtonElement;
        const language = DomManager.getSide(element).languageSelect;
        const textArea = DomManager.getSide(element).textArea;
        if (!SttManager.isListening()) {
            SttManager.startListening()
            element.classList.add("listening");
            textArea.placeholder = language.selectedOptions[0].dataset.listening!;
        }
        else {
            const transcript = await SttManager.stopListening(language.value);
            element.classList.remove("listening");
            textArea.value = transcript ?? "";
            DomManager.updateButton(DomManager.getSide(element));
            DomManager.resetTextAreaPlaceholder(DomManager.getSide(element));
        }
    });
});


[DomManager.up.languageSelect, DomManager.down.languageSelect].forEach((select) => {
    select.addEventListener("change", (event) => {
        const element = event.target as HTMLSelectElement;
        DomManager.resetTextAreaPlaceholder(DomManager.getSide(element));
        DomManager.saveSelectedLanguage(element);
    });
});

DomManager.flipButton.addEventListener("click", () => {
    DomManager.flipTop();
});

DomManager.loadSavedLanguages();