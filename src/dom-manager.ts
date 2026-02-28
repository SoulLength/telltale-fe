import { SttManager } from "./stt-manager";
import { sleep } from "./utils";

export class TranslatorSide {
    public readonly id: string
    public readonly content: HTMLDivElement;
    public readonly textArea: HTMLTextAreaElement;
    public readonly languageSelect: HTMLSelectElement;
    public readonly microphoneButton: HTMLButtonElement;
    public readonly sendButton: HTMLButtonElement;

    constructor(id: string) {
        this.id = id;
        this.content = document.querySelector(".translator[data-side='" + this.id + "'] .content") as HTMLDivElement;
        this.textArea = this.content.querySelector(".text-display") as HTMLTextAreaElement;
        this.languageSelect = this.content.querySelector("select.lang") as HTMLSelectElement;
        this.microphoneButton = this.content.querySelector("button.mic-btn") as HTMLButtonElement;
        this.sendButton = this.content.querySelector("button.send-btn") as HTMLButtonElement;
    }
}

export class DomManager {
    public static up = new TranslatorSide("up");
    public static down = new TranslatorSide("down");
    public static flipButton = document.querySelector(".flip-btn") as HTMLButtonElement;
    public static flipArrow = document.querySelector(".arrow.top") as HTMLButtonElement;


    public static getSide(element: HTMLElement) {
        const id = (element.closest(".translator") as HTMLElement).dataset.side;
        return [this.up, this.down].find((side) => side.id === id)!;
    }

    public static getOtherSides(side: TranslatorSide): TranslatorSide[] {
        return [this.up, this.down].filter(s => s !== side);
    }

    public static resetTextAreaPlaceholder(side: TranslatorSide): void {
        side.textArea.placeholder = side.languageSelect.selectedOptions[0].dataset.hint!;
    }

    public static updateButton(side: TranslatorSide): void {
        if (side.textArea.value === "" || SttManager.isListening()) {
            side.sendButton.style.display = "none";
            side.microphoneButton.style.display = "flex";
        } else {
            side.microphoneButton.style.display = "none";
            side.sendButton.style.display = "flex";
        }
    }

    public static loadSavedLanguages(): void {
        for (const side of [this.up, this.down]) {
            const savedLang = localStorage.getItem(`lang-${side.id}`);
            if (savedLang) {
                side.languageSelect.value = savedLang;
                this.resetTextAreaPlaceholder(side);
            }
        }
    }

    public static saveSelectedLanguage(select: HTMLSelectElement): void {
        localStorage.setItem(`lang-${this.getSide(select).id}`, select.value);
    }
    
    public static async flipTop() {
        this.up.content.classList.toggle("faded");
        this.flipArrow.classList.toggle("flipped");
        await sleep(200);
        this.up.content.classList.toggle("flipped");
        this.up.content.classList.toggle("faded");
    }
}