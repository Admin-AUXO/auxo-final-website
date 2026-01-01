const HERO_LINES = [
  "Most companies collect data. Few convert it into decisions.",
  "",
  "AUXO bridges the gap — connecting business understanding with data intelligence."
] as const;

const TYPING_SPEED = 35;
const LINE_PAUSE = 600;
const CHAR_DELAY_VARIANCE = 5;

let activeAnimationFrameId: number | null = null;
let activeTimeoutId: NodeJS.Timeout | null = null;

export function initValuePropositionTyping(containerId: string): void {
  if (activeAnimationFrameId !== null) {
    cancelAnimationFrame(activeAnimationFrameId);
    activeAnimationFrameId = null;
  }
  if (activeTimeoutId !== null) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  
  const container = document.getElementById(containerId);
  if (!container) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    const p1 = document.createElement('p');
    p1.textContent = HERO_LINES[0];
    const p2 = document.createElement('p');
    p2.innerHTML = '&nbsp;';
    const p3 = document.createElement('p');
    const auxoText = HERO_LINES[2];
    const auxoIndex = auxoText.indexOf('AUXO');
    if (auxoIndex >= 0) {
      p3.appendChild(document.createTextNode(auxoText.slice(0, auxoIndex)));
      const span = document.createElement('span');
      span.className = 'highlight-gradient';
      span.textContent = 'AUXO';
      p3.appendChild(span);
      p3.appendChild(document.createTextNode(auxoText.slice(auxoIndex + 4)));
    } else {
      p3.textContent = auxoText;
    }
    container.append(p1, p2, p3);
    return;
  }

  const placeholder = document.createElement('div');
  placeholder.className = `${container.className} typing-placeholder`;
  placeholder.innerHTML = `<p>${HERO_LINES[0]}</p><p>&nbsp;</p><p>${HERO_LINES[2]}</p>`;
  container.appendChild(placeholder);
  const reservedHeight = placeholder.offsetHeight;
  placeholder.remove();

  if (reservedHeight > 0) {
    container.style.setProperty('--typing-min-height', `${reservedHeight}px`);
    container.classList.add("typing-container");
  }

  const line1Element = document.createElement('p');
  const line2Element = document.createElement('p');
  const line3Element = document.createElement('p');

  line2Element.innerHTML = '&nbsp;'; // Non-breaking space requires innerHTML

  container.appendChild(line1Element);
  container.appendChild(line2Element);
  container.appendChild(line3Element);

  let lineIndex = 0;
  let charIndex = 0;
  const rendered: string[] = ["", "", ""];
  let isPausing = false;

  function renderLine(lineIndex: number, content: string, isTyping: boolean): void {
    const targetElement = lineIndex === 0 ? line1Element : line3Element;
    targetElement.textContent = '';
    
    try {
    if (lineIndex === 0) {
      targetElement.textContent = content;
      if (isTyping) {
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor temp-cursor';
        targetElement.appendChild(cursor);
      }
    } else if (lineIndex === 2) {
      const auxoIndex = content.indexOf("AUXO");
      if (auxoIndex >= 0 && content.length >= auxoIndex + 4) {
        targetElement.appendChild(document.createTextNode(content.slice(0, auxoIndex)));
        const span = document.createElement('span');
        span.className = 'highlight-gradient';
        span.textContent = 'AUXO';
        targetElement.appendChild(span);
        targetElement.appendChild(document.createTextNode(content.slice(auxoIndex + 4)));
      } else {
        targetElement.textContent = content;
      }
      if (isTyping) {
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor temp-cursor';
        targetElement.appendChild(cursor);
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Value proposition typing DOM error:', error);
  }
  }

  let lastTypedTime = performance.now();
  let animationFrameId: number;
  
  function typeNextChar() {
    if (isPausing) {
      animationFrameId = requestAnimationFrame(typeNextChar);
      return;
    }

    const now = performance.now();
    const baseDelay = TYPING_SPEED;
    const variance = Math.random() * CHAR_DELAY_VARIANCE;
    const delay = baseDelay + variance;

    if (now - lastTypedTime >= delay) {
      rendered[lineIndex] = HERO_LINES[lineIndex].slice(0, charIndex + 1);
      const isTyping = charIndex < HERO_LINES[lineIndex].length;
      renderLine(lineIndex, rendered[lineIndex], isTyping);

      charIndex++;
      lastTypedTime = now;

      if (charIndex > HERO_LINES[lineIndex].length) {
        if (lineIndex < HERO_LINES.length - 1) {
          isPausing = true;
          activeTimeoutId = setTimeout(() => {
            lineIndex++;
            charIndex = 0;
            isPausing = false;
            lastTypedTime = performance.now();
            activeAnimationFrameId = requestAnimationFrame(typeNextChar);
            animationFrameId = activeAnimationFrameId;
          }, LINE_PAUSE);
          return;
        } else {
          const cursor = document.createElement('span');
          cursor.className = 'typing-cursor';
          cursor.setAttribute('aria-hidden', 'true');
          line3Element.appendChild(cursor);
          return;
        }
      }
    }

    activeAnimationFrameId = requestAnimationFrame(typeNextChar);
    animationFrameId = activeAnimationFrameId;
  }

  activeAnimationFrameId = requestAnimationFrame(typeNextChar);
  animationFrameId = activeAnimationFrameId;
}

export function cleanupValuePropositionTyping(): void {
  if (activeAnimationFrameId !== null) {
    cancelAnimationFrame(activeAnimationFrameId);
    activeAnimationFrameId = null;
  }
  if (activeTimeoutId !== null) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
}

