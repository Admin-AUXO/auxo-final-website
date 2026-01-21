import { BREAKPOINTS } from '../constants';

class ScrollLockService {
  private locks = new Map<string, number>();
  private cachedScrollbarWidth: number | null = null;

  private getScrollbarWidth(): number {
    if (this.cachedScrollbarWidth !== null) {
      return this.cachedScrollbarWidth;
    }

    this.cachedScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    return this.cachedScrollbarWidth;
  }

  private getTotalLocks(): number {
    return Array.from(this.locks.values()).reduce((sum, count) => sum + count, 0);
  }

  private getLenisInstance(): any {
    return typeof window !== 'undefined' ? (window as any).__lenis : null;
  }

  private applyLock(): void {
    const lenisInstance = this.getLenisInstance();
    if (lenisInstance) {
      lenisInstance.stop();
    }

    const isMobile = window.innerWidth < BREAKPOINTS.MD;
    if (!isMobile) {
      const scrollbarWidth = this.getScrollbarWidth();
      document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  private removeLock(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.removeProperty('--scrollbar-width');
    document.documentElement.style.overflow = '';

    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    const lenisInstance = this.getLenisInstance();
    if (lenisInstance) {
      lenisInstance.start();
    }
  }

  lock(id: string): void {
    const currentCount = this.locks.get(id) || 0;
    this.locks.set(id, currentCount + 1);

    if (this.getTotalLocks() === 1) {
      this.applyLock();
    }

    if (typeof window !== 'undefined' && (window as any).__DEBUG_SCROLL_LOCK) {
      console.log(`[ScrollLock] Lock acquired by "${id}" (count: ${currentCount + 1}, total: ${this.getTotalLocks()})`);
    }
  }

  unlock(id: string): void {
    const currentCount = this.locks.get(id) || 0;

    if (currentCount > 0) {
      const newCount = currentCount - 1;
      if (newCount === 0) {
        this.locks.delete(id);
      } else {
        this.locks.set(id, newCount);
      }
    }

    if (this.getTotalLocks() === 0) {
      this.removeLock();
    }

    if (typeof window !== 'undefined' && (window as any).__DEBUG_SCROLL_LOCK) {
      console.log(`[ScrollLock] Lock released by "${id}" (was: ${currentCount}, now: ${currentCount > 0 ? currentCount - 1 : 0}, total: ${this.getTotalLocks()})`);
    }
  }

  forceUnlock(id: string): void {
    this.locks.delete(id);

    if (this.getTotalLocks() === 0) {
      this.removeLock();
    }
  }

  forceUnlockAll(): void {
    this.locks.clear();
    this.removeLock();
  }

  isLocked(): boolean {
    return this.getTotalLocks() > 0;
  }

  getActiveLocks(): string[] {
    return Array.from(this.locks.keys());
  }

  resetCache(): void {
    this.cachedScrollbarWidth = null;
  }
}

export const scrollLock = new ScrollLockService();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollLock.forceUnlockAll();
  });

  document.addEventListener('astro:before-preparation', () => {
    scrollLock.forceUnlockAll();
  });
}

export function lockScroll(): void {
  scrollLock.lock('legacy');
}

export function unlockScroll(): void {
  scrollLock.unlock('legacy');
}

export function forceUnlockScroll(): void {
  scrollLock.forceUnlockAll();
}

if (typeof window !== 'undefined') {
  (window as any).__debugScrollLock = () => {
    const locks = scrollLock.getActiveLocks();
    const isLocked = scrollLock.isLocked();
    console.log('[ScrollLock Debug]', {
      isLocked,
      activeLocks: locks,
      totalLocks: locks.length,
      bodyClasses: Array.from(document.body.classList),
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
    });
    return { isLocked, activeLocks: locks };
  };

  (window as any).__forceUnlockScroll = () => {
    console.log('[ScrollLock] Forcing unlock of all scroll locks');
    scrollLock.forceUnlockAll();
  };
}
