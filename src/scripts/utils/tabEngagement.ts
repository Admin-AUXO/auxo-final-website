// Tab engagement: title animations, favicon changes, and user re-engagement

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
  private inactivityTimer: number | null = null;
  private faviconInterval: number | null = null;
  private originalFavicon: string = '';
  private faviconIndex: number = 0;

  private readonly emojis = {
    wave: ['👋', '✨'],
    notification: ['🔔', '💬'],
    attention: ['👀', '⚡'],
    data: ['📊', '📈'],
  };

  private readonly faviconColors = [
    '#7CB342', // accent-green
    '#5a9030', // darker green
  ];

  constructor(config: Partial<TabEngagementConfig> = {}) {
    this.config = {
      enabled: true,
      titleMessages: [
        '👋 Come back to AUXO!',
        '✨ Your data insights await',
        '📊 Let\'s transform your analytics',
        '⚡ AUXO Data Labs',
      ],
      titleInterval: 2000,
      faviconEnabled: true,
      inactivityThreshold: 300000, // 5 minutes
      showWelcomeBack: true,
      ...config,
    };

    this.originalTitle = document.title;
    this.originalFavicon = this.getFaviconHref();

    if (this.config.enabled) {
      this.init();
    }
  }

  private init(): void {
    this.setupVisibilityListener();
    this.setupInactivityDetection();
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onTabHidden();
      } else {
        this.onTabVisible();
      }
    });
  }

  private setupInactivityDetection(): void {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActiveTime = Date.now();
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer);
          this.inactivityTimer = null;
        }
      }, { passive: true });
    });
  }

  private onTabHidden(): void {
    this.isTabVisible = false;

    this.startTitleAnimation();

    if (this.config.faviconEnabled) {
      this.startFaviconAnimation();
    }

    this.inactivityTimer = window.setTimeout(() => {
      this.onInactivityThreshold();
    }, this.config.inactivityThreshold);
  }

  private onTabVisible(): void {
    this.isTabVisible = true;

    this.stopTitleAnimation();
    this.stopFaviconAnimation();

    document.title = this.originalTitle;
    this.setFavicon(this.originalFavicon);

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    const inactiveDuration = Date.now() - this.lastActiveTime;
    if (inactiveDuration > this.config.inactivityThreshold && this.config.showWelcomeBack) {
      this.showWelcomeBackOverlay(inactiveDuration);
    }

    this.lastActiveTime = Date.now();
  }

  private onInactivityThreshold(): void {
    // Additional actions for prolonged inactivity can be added here
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

  private showWelcomeBackOverlay(inactiveDuration: number): void {
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

    requestAnimationFrame(() => {
      overlay.classList.add('auxo-engagement-overlay-visible');
    });

    const autoDismissTimer = setTimeout(() => {
      this.dismissOverlay(overlay);
    }, 5000);

    const dismissBtn = overlay.querySelector('[data-dismiss-overlay]');
    dismissBtn?.addEventListener('click', () => {
      clearTimeout(autoDismissTimer);
      this.dismissOverlay(overlay);
    });

    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimeout(autoDismissTimer);
        this.dismissOverlay(overlay);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  private dismissOverlay(overlay: HTMLElement): void {
    overlay.classList.remove('auxo-engagement-overlay-visible');
    overlay.classList.add('auxo-engagement-overlay-exit');

    setTimeout(() => {
      overlay.remove();
    }, 300);
  }

  public updateConfig(config: Partial<TabEngagementConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public destroy(): void {
    this.stopTitleAnimation();
    this.stopFaviconAnimation();

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    document.title = this.originalTitle;
    this.setFavicon(this.originalFavicon);
  }
}

let tabEngagement: TabEngagementManager | null = null;

export function initTabEngagement(config?: Partial<TabEngagementConfig>): TabEngagementManager {
  if (!tabEngagement) {
    tabEngagement = new TabEngagementManager(config);
  }
  return tabEngagement;
}

export function getTabEngagement(): TabEngagementManager | null {
  return tabEngagement;
}

export function destroyTabEngagement(): void {
  if (tabEngagement) {
    tabEngagement.destroy();
    tabEngagement = null;
  }
}
