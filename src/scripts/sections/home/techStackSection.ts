import AOS from 'aos';

export function initTechStackSection() {
  const track = document.getElementById('tech-stack-track');
  if (!track) return;

  // Randomize items order on client side for each user
  const randomizeItems = () => {
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length === 0) return;
    
    // Get unique items (first half)
    const uniqueItems = items.slice(0, items.length / 2);
    
    // Fisher-Yates shuffle
    for (let i = uniqueItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueItems[i], uniqueItems[j]] = [uniqueItems[j], uniqueItems[i]];
    }
    
    // Recreate the track with randomized items duplicated
    const shuffledItems = [...uniqueItems, ...uniqueItems.map(el => el.cloneNode(true) as HTMLElement)];
    
    // Clear and repopulate
    track.innerHTML = '';
    shuffledItems.forEach((item, index) => {
      item.setAttribute('data-index', index.toString());
      item.setAttribute('data-aos-delay', String(30 + (index % uniqueItems.length) * 10));
      track.appendChild(item);
    });
  };

  // Wait for AOS to initialize the animation
  const startAnimation = () => {
    if (track.classList.contains('aos-animate')) {
      track.style.animationPlayState = 'running';
    }
  };

  // Randomize items first
  randomizeItems();

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

