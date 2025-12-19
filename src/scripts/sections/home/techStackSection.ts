import AOS from 'aos';

export function initTechStackSection() {
  const track = document.getElementById('tech-stack-track');
  if (!track) return;

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
