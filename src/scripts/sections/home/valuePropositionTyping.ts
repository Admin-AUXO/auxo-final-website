const HERO_LINES = [
  "Most companies collect data. Few convert it into decisions.",
  "",
  "AUXO bridges the gap — connecting business understanding with data intelligence."
];

const TYPING_SPEED = 28;
const LINE_PAUSE = 400;

export function initValuePropositionTyping(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    container.innerHTML = `
      <p class="text-display-md">${HERO_LINES[0]}</p>
      <p class="text-display-md">&nbsp;</p>
      <p class="text-display-md">${HERO_LINES[2].replace('AUXO', '<span class="highlight-gradient auxo-glow">AUXO</span>')}</p>
    `;
    return;
  }

  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'position: absolute; visibility: hidden; height: auto; width: 100%; pointer-events: none; opacity: 0; top: 0; left: 0;';
  placeholder.className = container.className;
  placeholder.innerHTML = `
    <p class="text-display-md">${HERO_LINES[0]}</p>
    <p class="text-display-md">&nbsp;</p>
    <p class="text-display-md">${HERO_LINES[2]}</p>
  `;

  container.appendChild(placeholder);
  void container.offsetHeight;

  const reservedHeight = placeholder.offsetHeight;
  if (reservedHeight > 0) {
    container.style.setProperty('--typing-min-height', `${reservedHeight}px`);
    container.classList.add("typing-container");
  }

  placeholder.remove();

  const line1Element = document.createElement('p');
  const line2Element = document.createElement('p');
  const line3Element = document.createElement('p');

  line1Element.className = 'text-display-md';
  line2Element.className = 'text-display-md';
  line3Element.className = 'text-display-md';

  line2Element.innerHTML = '&nbsp;';

  container.appendChild(line1Element);
  container.appendChild(line2Element);
  container.appendChild(line3Element);

  let lineIndex = 0;
  let charIndex = 0;
  const rendered: string[] = ["", "", ""];
  let isPausing = false;

  const timer = window.setInterval(() => {
    if (isPausing) return;

    rendered[lineIndex] = HERO_LINES[lineIndex].slice(0, charIndex + 1);
    const isTyping = charIndex < HERO_LINES[lineIndex].length;
    const cursorHTML = isTyping ? '<span class="typing-cursor temp-cursor"></span>' : '';

    if (lineIndex === 0) {
      line1Element.innerHTML = rendered[0] + cursorHTML;
    } else if (lineIndex === 2) {
      const line3 = rendered[2];
      const auxoIndex = line3.indexOf("AUXO");

      if (auxoIndex >= 0 && line3.length >= auxoIndex + 4) {
        const beforeAuxo = line3.slice(0, auxoIndex);
        const afterAuxo = line3.slice(auxoIndex + 4);
        line3Element.innerHTML = `${beforeAuxo}<span class="highlight-gradient auxo-glow">AUXO</span>${afterAuxo}${cursorHTML}`;
      } else {
        line3Element.innerHTML = line3 + cursorHTML;
      }
    }

    charIndex++;

    if (charIndex > HERO_LINES[lineIndex].length) {
      if (lineIndex < HERO_LINES.length - 1) {
        isPausing = true;
        setTimeout(() => {
          lineIndex++;
          charIndex = 0;
          isPausing = false;
        }, LINE_PAUSE);
      } else {
        window.clearInterval(timer);
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        line3Element.appendChild(cursor);
        return;
      }
    }
  }, TYPING_SPEED);
}

