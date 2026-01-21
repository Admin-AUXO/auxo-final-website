let isUsingKeyboard = false;

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    isUsingKeyboard = true;
    document.body.classList.add('keyboard-nav');
  }
}

function handleMouseDown() {
  isUsingKeyboard = false;
  document.body.classList.remove('keyboard-nav');
}

export function initKeyboardNavigation() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
}

export function cleanupKeyboardNavigation() {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousedown', handleMouseDown);
  document.body.classList.remove('keyboard-nav');
}

export function isKeyboardNavigating(): boolean {
  return isUsingKeyboard;
}
