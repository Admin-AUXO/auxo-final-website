import AOS from 'aos';

let hasRandomized = false;

export function initTechStackSection() {
  const track = document.getElementById('tech-stack-track');
  if (!track) return;

  // Randomize items once per page load
  // This ensures order only changes on page reload, not during scrolling or animations
  if (!hasRandomized) {
    const items = Array.from(track.children) as HTMLElement[];
    
    if (items.length > 0) {
      // Get unique items (first half of duplicated array)
      const uniqueItems = items.slice(0, items.length / 2);
      
      // Create shuffled indices using Fisher-Yates shuffle
      const shuffledIndices = Array.from({ length: uniqueItems.length }, (_, i) => i);
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
      
      // Only reorder if indices are different from original order
      const originalIndices = Array.from({ length: uniqueItems.length }, (_, i) => i);
      const needsReorder = !shuffledIndices.every((val, idx) => val === originalIndices[idx]);
      
      if (needsReorder) {
        // Reorder items based on shuffled indices
        const shuffledItems = shuffledIndices.map(i => uniqueItems[i]);
        const duplicatedShuffled = [...shuffledItems, ...shuffledItems.map((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          return clone;
        })];
        
        // Update data-index attributes
        duplicatedShuffled.forEach((item, index) => {
          item.setAttribute('data-index', index.toString());
        });
        
        // Replace content
        track.innerHTML = '';
        duplicatedShuffled.forEach(item => track.appendChild(item));
      }
      
      hasRandomized = true;
    }
  }

  // Wait for AOS to initialize the animation
  const startAnimation = () => {
    if (track.classList.contains('aos-animate')) {
      track.style.animationPlayState = 'running';
    }
  };

  // Listen for AOS animation start
  track.addEventListener('aos:in', () => {
    startAnimation();
  });

  // Also check if already animated
  if (track.classList.contains('aos-animate')) {
    startAnimation();
  }

  // Pause on hover
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

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initTechStackSection, 100);
    });
  } else {
    setTimeout(initTechStackSection, 100);
  }
}

