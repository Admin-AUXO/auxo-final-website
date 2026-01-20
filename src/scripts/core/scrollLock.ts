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
export function lockScroll(): void {
  scrollLock.lock('legacy');
}

export function unlockScroll(): void {
  scrollLock.unlock('legacy');
}

export function forceUnlockScroll(): void {
  scrollLock.forceUnlockAll();
}
