export function setupSmoothScroll(): void {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const navHeight = 80;

  anchorLinks.forEach((link) => {
    const newLink = link.cloneNode(true) as HTMLAnchorElement;
    link.parentNode?.replaceChild(newLink, link);

    newLink.addEventListener("click", (e) => {
      const href = newLink.getAttribute("href");
      if (!href || href === "#" || !href.startsWith("#")) return;

      const targetId = href.substring(1);
      const target = document.getElementById(targetId) || document.querySelector(href);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });
}

export function setupPageAnimations(): void {
  setupSmoothScroll();
}

