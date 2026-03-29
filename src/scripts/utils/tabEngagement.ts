import { logger } from '@/lib/logger';
import { loadStylesheet } from '@/scripts/utils/thirdPartyLoader';
interface TabEngagementConfig {
  enabled: boolean;
  titleMessages: string[];
  titleInterval: number;
  faviconEnabled: boolean;
  inactivityThreshold: number;
  showWelcomeBack: boolean;
}

class TabEngagementManager {
  private config: TabEngagementConfig;
  private originalTitle: string;
  private isTabVisible: boolean = true;
  private titleInterval: number | null = null;
  private messageIndex: number = 0;
  private lastActiveTime: number = Date.now();
  private faviconInterval: number | null = null;
  private originalFavicon: string = '';
  private faviconIndex: number = 0;
  private cleanupCallbacks: Array<() => void> = [];
  private stylesLoaded = false;

  private readonly faviconColors = [
    '#7CB342', 
    '#5a9030', 
  ];

  constructor(config: Partial<TabEngagementConfig> = {}) {
    this.config = {
      enabled: true,
      titleMessages: [
        '✨ Your data insights await',
        '📊 Let\'s transform your analytics',
        '⚡ AUXO Data Labs',
      ],
      titleInterval: 2000,
      faviconEnabled: true,
      inactivityThreshold: 300000, 
      showWelcomeBack: true,
      ...config,
    };

    this.originalTitle = document.title;
    this.originalFavicon = this.getFaviconHref();

    logger.debug('[TabEngagement] Initialized with title:', this.originalTitle);

    if (this.config.enabled) {
      this.init();
    }
  }

  private init(): void {
    this.setupVisibilityListener();
    this.setupInactivityDetection();
  }

  private setupVisibilityListener(): void {
    if (typeof document.hidden === 'undefined' || typeof document.visibilityState === 'undefined') {
      logger.warn('Page Visibility API not supported');
      return;
    }

    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        this.onTabHidden();
      } else if (document.visibilityState === 'visible') {
        this.onTabVisible();
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler, false);

    this.cleanupCallbacks.push(() => {
      document.removeEventListener('visibilitychange', visibilityHandler, false);
    });
  }

  private setupInactivityDetection(): void {
    const activityEvents: Array<keyof DocumentEventMap> = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      this.lastActiveTime = Date.now();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    this.cleanupCallbacks.push(() => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    });
  }

  private onTabHidden(): void {
    this.isTabVisible = false;
    logger.debug('[TabEngagement] Tab hidden - starting animations');

    this.startTitleAnimation();

    if (this.config.faviconEnabled) {
      this.startFaviconAnimation();
    }
  }

  private onTabVisible(): void {
    this.isTabVisible = true;
    logger.debug('[TabEngagement] Tab visible - stopping animations');

    this.stopTitleAnimation();
    this.stopFaviconAnimation();

    document.title = this.originalTitle;
    this.setFavicon(this.originalFavicon);

    const inactiveDuration = Date.now() - this.lastActiveTime;
    if (inactiveDuration > this.config.inactivityThreshold && this.config.showWelcomeBack) {
      void this.showWelcomeBackOverlay(inactiveDuration);
    }

    this.lastActiveTime = Date.now();
  }

  private startTitleAnimation(): void {
    if (this.titleInterval) return;

    this.messageIndex = 0;
    this.titleInterval = window.setInterval(() => {
      if (!this.isTabVisible) {
        document.title = this.config.titleMessages[this.messageIndex];
        this.messageIndex = (this.messageIndex + 1) % this.config.titleMessages.length;
      }
    }, this.config.titleInterval);
  }

  private stopTitleAnimation(): void {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }
  }

  private startFaviconAnimation(): void {
    if (this.faviconInterval) return;

    this.faviconIndex = 0;
    this.faviconInterval = window.setInterval(() => {
      if (!this.isTabVisible) {
        const color = this.faviconColors[this.faviconIndex];
        this.setAnimatedFavicon(color);
        this.faviconIndex = (this.faviconIndex + 1) % this.faviconColors.length;
      }
    }, 1000);
  }

  private stopFaviconAnimation(): void {
    if (this.faviconInterval) {
      clearInterval(this.faviconInterval);
      this.faviconInterval = null;
    }
  }

  private getFaviconHref(): string {
    const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    return link?.href || '/favicon.ico';
  }

  private setFavicon(href: string): void {
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  private setAnimatedFavicon(color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 32, 32);

      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();

      this.setFavicon(canvas.toDataURL());
    }
  }

  private async ensureStylesLoaded(): Promise<void> {
    if (this.stylesLoaded) return;

    await loadStylesheet('/styles/tab-engagement.css', 'tab-engagement-style');
    this.stylesLoaded = true;
  }

  private async showWelcomeBackOverlay(inactiveDuration: number): Promise<void> {
    try {
      await this.ensureStylesLoaded();
    } catch (error) {
      logger.warn('[TabEngagement] Styles failed to load', error);
      return;
    }

    if (document.getElementById('auxo-welcome-back-overlay')) return;

    const minutes = Math.floor(inactiveDuration / 60000);
    const message = minutes > 10
      ? 'Welcome back! Your session has been refreshed.'
      : 'Welcome back! Ready to continue?';

    const overlay = document.createElement('div');
    overlay.id = 'auxo-welcome-back-overlay';
    overlay.className = 'auxo-engagement-overlay';
    overlay.innerHTML = `
      <div class="auxo-engagement-card">
        <div class="auxo-engagement-icon">
          <svg class="auxo-engagement-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="auxo-engagement-title">Welcome Back! 👋</h3>
        <p class="auxo-engagement-message">${message}</p>
        <button class="auxo-engagement-button" data-dismiss-overlay>
          Continue
          <svg class="auxo-engagement-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.ensureScrollEnabled();

    requestAnimationFrame(() => {
      overlay.classList.add('auxo-engagement-overlay-visible');
    });

    let isDismissed = false;
    let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanupEscapeHandler = () => {
      document.removeEventListener('keydown', escapeHandler);
    };
    const dismissOverlay = () => {
      if (isDismissed) return;
      isDismissed = true;
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
        autoDismissTimer = null;
      }
      cleanupEscapeHandler();
      this.dismissOverlay(overlay);
    };

    const dismissBtn = overlay.querySelector('[data-dismiss-overlay]');
    const handleDismiss = () => {
      dismissOverlay();
    };
    dismissBtn?.addEventListener('click', handleDismiss, { once: true });

    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissOverlay();
      }
    };
    document.addEventListener('keydown', escapeHandler);

    autoDismissTimer = setTimeout(() => {
      dismissOverlay();
    }, 5000);
  }

  private dismissOverlay(overlay: HTMLElement): void {
    overlay.classList.remove('auxo-engagement-overlay-visible');
    overlay.classList.add('auxo-engagement-overlay-exit');

    this.ensureScrollEnabled();

    setTimeout(() => {
      overlay.remove();
      this.ensureScrollEnabled();
    }, 300);
  }

  private ensureScrollEnabled(): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.removeProperty('--scrollbar-width');

    const lenisInstance = typeof window !== 'undefined' ? window.__lenis : null;
    if (lenisInstance?.start) {
      lenisInstance.start();
    }
  }

  public updateConfig(config: Partial<TabEngagementConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public destroy(): void {
    this.stopTitleAnimation();
    this.stopFaviconAnimation();

    this.cleanupCallbacks.forEach((cleanup) => cleanup());
    this.cleanupCallbacks.length = 0;

    document.title = this.originalTitle;
    this.setFavicon(this.originalFavicon);

    const overlay = document.getElementById('auxo-welcome-back-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

let tabEngagement: TabEngagementManager | null = null;

export function initTabEngagement(config?: Partial<TabEngagementConfig>): TabEngagementManager {
  if (!tabEngagement) {
    tabEngagement = new TabEngagementManager(config);
  }
  return tabEngagement;
}

export function destroyTabEngagement(): void {
  if (tabEngagement) {
    tabEngagement.destroy();
    tabEngagement = null;
  }
}
