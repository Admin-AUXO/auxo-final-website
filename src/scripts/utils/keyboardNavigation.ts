function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
}

function handleMouseDown() {
  document.body.classList.remove('keyboard-nav');
}

export function initKeyboardNavigation(): void {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
}

export function cleanupKeyboardNavigation(): void {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousedown', handleMouseDown);
  document.body.classList.remove('keyboard-nav');
}
