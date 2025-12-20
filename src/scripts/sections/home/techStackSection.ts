function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomizeTrackItems(track: HTMLElement): void {
  const items = Array.from(track.children) as HTMLElement[];
  if (items.length === 0) {
    return;
  }

  const itemsPerGroup = items.length / 2;
  
  if (itemsPerGroup < 1 || !Number.isInteger(itemsPerGroup)) {
    return;
  }

  const uniqueItems = items.slice(0, itemsPerGroup);
  const shuffledItems = shuffleArray(uniqueItems);
  const duplicatedShuffled = [
    ...shuffledItems,
    ...shuffledItems.map((el) => el.cloneNode(true) as HTMLElement)
  ];

  while (track.firstChild) {
    track.removeChild(track.firstChild);
  }
  duplicatedShuffled.forEach(item => track.appendChild(item));
}

export function initTechStackSection(): void {
  const track = document.getElementById('tech-stack-track') as HTMLElement;
  const wrapper = track?.closest('.tech-stack-marquee-wrapper') as HTMLElement;
  
  if (!track || !wrapper) {
    return;
  }

  const items = Array.from(track.children);
  if (items.length === 0) {
    return;
  }

  if (!wrapper.hasAttribute('data-randomized')) {
    randomizeTrackItems(track);
    wrapper.setAttribute('data-randomized', 'true');
  }

  if (!wrapper.hasAttribute('data-hover-initialized')) {
    wrapper.setAttribute('data-hover-initialized', 'true');
    wrapper.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }
}
