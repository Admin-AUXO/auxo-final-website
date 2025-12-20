const HERO_LINES = [
  "Most companies collect data. Few convert it into decisions.",
  "",
  "AUXO bridges the gap — connecting business understanding with data intelligence."
] as const;

const TYPING_SPEED = 35;
const LINE_PAUSE = 600;
const CHAR_DELAY_VARIANCE = 5;

export function initValuePropositionTyping(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    container.innerHTML = `
      <p>${HERO_LINES[0]}</p>
      <p>&nbsp;</p>
      <p>${HERO_LINES[2].replace('AUXO', '<span class="highlight-gradient">AUXO</span>')}</p>
    `;
    return;
  }

  const placeholder = document.createElement('div');
  Object.assign(placeholder.style, {
    position: 'absolute',
    visibility: 'hidden',
    height: 'auto',
    width: '100%',
    pointerEvents: 'none',
    opacity: '0',
    top: '0',
    left: '0'
  });
  placeholder.className = container.className;
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

  line2Element.innerHTML = '&nbsp;';

  container.appendChild(line1Element);
  container.appendChild(line2Element);
  container.appendChild(line3Element);

  let lineIndex = 0;
  let charIndex = 0;
  const rendered: string[] = ["", "", ""];
  let isPausing = false;

  function renderLine(lineIndex: number, content: string, isTyping: boolean): void {
    const cursorHTML = isTyping ? '<span class="typing-cursor temp-cursor"></span>' : '';
    const targetElement = lineIndex === 0 ? line1Element : line3Element;

    if (lineIndex === 0) {
      targetElement.innerHTML = content + cursorHTML;
    } else if (lineIndex === 2) {
      const auxoIndex = content.indexOf("AUXO");
      if (auxoIndex >= 0 && content.length >= auxoIndex + 4) {
        const beforeAuxo = content.slice(0, auxoIndex);
        const afterAuxo = content.slice(auxoIndex + 4);
        targetElement.innerHTML = `${beforeAuxo}<span class="highlight-gradient">AUXO</span>${afterAuxo}${cursorHTML}`;
      } else {
        targetElement.innerHTML = content + cursorHTML;
      }
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
          setTimeout(() => {
            lineIndex++;
            charIndex = 0;
            isPausing = false;
            lastTypedTime = performance.now();
            animationFrameId = requestAnimationFrame(typeNextChar);
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

    animationFrameId = requestAnimationFrame(typeNextChar);
  }

  animationFrameId = requestAnimationFrame(typeNextChar);
}

