import AOS from 'aos';

let hasRandomized = false;

export function initTechStackSection() {
  const track = document.getElementById('tech-stack-track');
  if (!track) return;

  if (!hasRandomized) {
    const items = Array.from(track.children) as HTMLElement[];
    
    if (items.length > 0) {
      const uniqueItems = items.slice(0, items.length / 3);
      const shuffledIndices = Array.from({ length: uniqueItems.length }, (_, i) => i);
      
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
      
      const originalIndices = Array.from({ length: uniqueItems.length }, (_, i) => i);
      const needsReorder = !shuffledIndices.every((val, idx) => val === originalIndices[idx]);
      
      if (needsReorder) {
        const shuffledItems = shuffledIndices.map(i => uniqueItems[i]);
        const duplicatedShuffled = [
          ...shuffledItems,
          ...shuffledItems.map((el) => el.cloneNode(true) as HTMLElement),
          ...shuffledItems.map((el) => el.cloneNode(true) as HTMLElement)
        ];
        
        duplicatedShuffled.forEach((item, index) => {
          item.setAttribute('data-index', index.toString());
        });
        
        track.style.animationPlayState = 'paused';
        track.innerHTML = '';
        duplicatedShuffled.forEach(item => track.appendChild(item));
        
        requestAnimationFrame(() => {
          track.style.animationPlayState = 'running';
        });
      }
      
      hasRandomized = true;
    }
  }

  const startAnimation = () => {
    if (track.classList.contains('aos-animate')) {
      track.style.animationPlayState = 'running';
    }
  };

  track.addEventListener('aos:in', () => {
    startAnimation();
  });

  if (track.classList.contains('aos-animate')) {
    startAnimation();
  }

  const wrapper = track.closest('.tech-stack-marquee-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });

    wrapper.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initTechStackSection, 100);
    });
  } else {
    setTimeout(initTechStackSection, 100);
  }
}

