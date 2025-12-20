export function initTableOfContents(): void {
  const toc = document.getElementById('table-of-contents');
  const tocMobile = document.getElementById('table-of-contents-mobile');
  const content = document.querySelector('.legal-content');
  const mobileToggle = document.getElementById('mobile-toc-toggle');
  const mobileTocContainer = document.getElementById('mobile-table-of-contents');
  
  if (!content) return;
  
  const headings = content.querySelectorAll<HTMLHeadingElement>('h2, h3');
  
  const updateActiveLink = (container: HTMLElement | null, targetId: string): void => {
    if (!container) return;
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      link.classList.remove('text-accent-green', 'bg-accent-green/10', 'font-semibold');
      link.classList.add('text-theme-secondary');
    });
    const activeLink = container.querySelector(`a[data-target="${targetId}"]`);
    if (activeLink) {
      activeLink.classList.remove('text-theme-secondary');
      activeLink.classList.add('text-accent-green', 'bg-accent-green/10', 'font-semibold');
    }
  };

  const createTocLink = (heading: HTMLHeadingElement, index: number): HTMLAnchorElement => {
    const id = `section-${index + 1}`;
    heading.id = id;
    const isH3 = heading.tagName === 'H3';
    const text = heading.textContent || '';
    
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = `flex items-start gap-2 py-2 px-3 rounded-lg text-theme-secondary hover:text-accent-green hover:bg-accent-green/5 transition-all duration-fast group ${isH3 ? 'ml-4' : ''}`;
    link.setAttribute('data-target', id);
    
    const indicator = document.createElement('span');
    indicator.className = `text-accent-green/60 group-hover:text-accent-green transition-colors mt-0.5 flex-shrink-0`;
    indicator.textContent = isH3 ? '▸' : '●';
    
    const span = document.createElement('span');
    span.className = 'text-sm font-medium leading-relaxed';
    span.textContent = text;
    
    link.appendChild(indicator);
    link.appendChild(span);
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', `#${id}`);
        if (mobileTocContainer && !mobileTocContainer.classList.contains('hidden')) {
          mobileTocContainer.classList.add('hidden');
          mobileToggle?.setAttribute('aria-expanded', 'false');
        }
      }
    });
    
    return link;
  };
  
  if (toc) {
    headings.forEach((heading, index) => {
      toc.appendChild(createTocLink(heading, index).cloneNode(true) as HTMLElement);
    });
  }
  
  if (tocMobile) {
    headings.forEach((heading, index) => {
      tocMobile.appendChild(createTocLink(heading, index));
    });
  }
  
  mobileToggle?.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', (!isExpanded).toString());
    mobileTocContainer?.classList.toggle('hidden');
  });
  
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          updateActiveLink(toc, entry.target.id);
          updateActiveLink(tocMobile, entry.target.id);
        }
      }
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    
    Array.from(headings).forEach((heading) => {
      observer.observe(heading);
    });
  }
}
