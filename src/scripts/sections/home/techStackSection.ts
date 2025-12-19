import AOS from 'aos';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function initTechStackSection() {
  const track = document.getElementById('tech-stack-track');
  if (!track) return;

  // Randomize items order
  const items = Array.from(track.children) as HTMLElement[];
  if (items.length > 0) {
    // Get unique items (first half, before duplication)
    const uniqueItems = items.slice(0, items.length / 2);
    const shuffledUnique = shuffleArray(uniqueItems);
    // Duplicate shuffled items for seamless loop
    const shuffledAll = [...shuffledUnique, ...shuffledUnique];
    
    // Clear and re-append in random order
    track.innerHTML = '';
    shuffledAll.forEach((item, index) => {
      // Update data-index and data-aos-delay
      item.setAttribute('data-index', index.toString());
      const delay = 50 + (index % shuffledUnique.length) * 20;
      item.setAttribute('data-aos-delay', delay.toString());
      track.appendChild(item);
    });
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

  // Also initialize after AOS refresh
  document.addEventListener('aos:in', () => {
    initTechStackSection();
  });
}
