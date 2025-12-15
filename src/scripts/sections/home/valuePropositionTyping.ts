const HERO_LINES = [
  "Most companies collect data. Few convert it into decisions.",
  "",
  "AUXO bridges the gap — connecting business understanding with data intelligence."
];

export function initValuePropositionTyping(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    // Show all text immediately for reduced motion
    container.innerHTML = `
      <p>${HERO_LINES[0]}</p>
      <p>&nbsp;</p>
      <p>${HERO_LINES[2].replace('AUXO', '<span class="auxo-glow">AUXO</span>')}</p>
    `;
    return;
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

  const timer = window.setInterval(() => {
    rendered[lineIndex] = HERO_LINES[lineIndex].slice(0, charIndex + 1);
    
    // Update the displayed content for the current line
    if (lineIndex === 0) {
      line1Element.textContent = rendered[0];
    } else if (lineIndex === 1) {
      // Empty line, already rendered as &nbsp;
      // No update needed
    } else if (lineIndex === 2) {
      const line3 = rendered[2];
      const auxoIndex = line3.indexOf("AUXO");
      // Only highlight if "AUXO" is fully typed
      if (auxoIndex >= 0 && line3.length >= auxoIndex + 4) {
        const beforeAuxo = line3.slice(0, auxoIndex);
        const afterAuxo = line3.slice(auxoIndex + 4);
        line3Element.innerHTML = beforeAuxo + 
          '<span class="auxo-glow">AUXO</span>' + 
          afterAuxo;
      } else {
        // "AUXO" not yet fully typed, show plain text
        line3Element.textContent = line3;
      }
    }

    charIndex++;

    if (charIndex > HERO_LINES[lineIndex].length) {
      lineIndex++;
      charIndex = 0;
      
      // Check if we're done
      if (lineIndex >= HERO_LINES.length) {
        window.clearInterval(timer);
        // Add cursor when done
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        line3Element.appendChild(cursor);
        return;
      }
    }
  }, 32);

  // Cleanup function would be needed if component can be unmounted
}

