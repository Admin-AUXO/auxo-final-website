const DEFAULT_SPEED = 100;
const DEFAULT_DELETE_SPEED = 50;
const DEFAULT_PAUSE_BEFORE_DELETE = 2000;
const DEFAULT_PAUSE_BEFORE_LOOP = 500;

export interface TypingAnimationOptions {
  speed?: number;
  deleteSpeed?: number;
  pauseBeforeDelete?: number;
  pauseBeforeLoop?: number;
  loop?: boolean;
  showCursor?: boolean;
  onComplete?: () => void;
}

export class TypingAnimation {
  private charIndex: number = 0;
  private isDeleting: boolean = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private cursorElement: HTMLElement | null = null;

  constructor(
    private element: HTMLElement,
    private text: string,
    private options: TypingAnimationOptions = {}
  ) {
    const {
      speed = DEFAULT_SPEED,
      deleteSpeed = DEFAULT_DELETE_SPEED,
      pauseBeforeDelete = DEFAULT_PAUSE_BEFORE_DELETE,
      pauseBeforeLoop = DEFAULT_PAUSE_BEFORE_LOOP,
      loop = false,
      showCursor = false,
    } = options;

    this.options = {
      speed,
      deleteSpeed,
      pauseBeforeDelete,
      pauseBeforeLoop,
      loop,
      showCursor,
      onComplete: options.onComplete,
    };

    if (this.options.showCursor) {
      this.createCursor();
    }
  }

  private createCursor(): void {
    this.cursorElement = document.createElement('span');
    this.cursorElement.className = 'typing-cursor';
    this.cursorElement.textContent = '|';
    this.element.parentNode?.insertBefore(
      this.cursorElement,
      this.element.nextSibling
    );
  }

  start(): void {
    this.charIndex = 0;
    this.isDeleting = false;
    this.type();
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.cursorElement) {
      this.cursorElement.remove();
      this.cursorElement = null;
    }
  }

  private type(): void {
    const { speed, deleteSpeed, pauseBeforeDelete, pauseBeforeLoop, loop, onComplete } = this.options;
    const currentText = this.text.substring(0, this.charIndex);
    this.element.textContent = currentText;

    if (!this.isDeleting && this.charIndex < this.text.length) {
      this.charIndex++;
      this.timer = setTimeout(() => this.type(), speed);
    } else if (this.isDeleting && this.charIndex > 0) {
      this.charIndex--;
      this.timer = setTimeout(() => this.type(), deleteSpeed);
    } else if (this.charIndex === this.text.length) {
      if (loop) {
        this.timer = setTimeout(() => {
          this.isDeleting = true;
          this.type();
        }, pauseBeforeDelete);
      } else {
        if (this.cursorElement) {
          this.cursorElement.remove();
          this.cursorElement = null;
        }
        if (onComplete) {
          onComplete();
        }
      }
    } else if (this.charIndex === 0 && this.isDeleting && loop) {
      this.isDeleting = false;
      this.timer = setTimeout(() => this.type(), pauseBeforeLoop);
    }
  }

  setText(newText: string): void {
    this.stop();
    this.text = newText;
    this.start();
  }
}

