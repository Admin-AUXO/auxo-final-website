interface AnalyticsModule {
  name: string;
  condition: () => boolean;
  load: () => Promise<any>;
  priority: 'critical' | 'standard' | 'low';
}

const isMobile = () => window.innerWidth < 768;
const hasForm = () => document.querySelector('form') !== null;
const hasCalendar = () => document.querySelector('[data-google-calendar]') !== null;
const isHomepage = () => window.location.pathname === '/' || window.location.pathname === '/index.html';
const isServicesPage = () => window.location.pathname.includes('/services');

export class ConditionalAnalyticsLoader {
  private loadedModules: Set<string> = new Set();
  private cleanupFunctions: Map<string, () => void> = new Map();
  private maxScripts = 5;
  private initStartTime: number = 0;
  private maxInitTime = 2000;

  private modules: AnalyticsModule[] = [
    {
      name: 'identifiers',
      condition: () => true,
      load: async () => {
        const { initIdentifiers } = await import('./identifiers');
        initIdentifiers();
      },
      priority: 'critical',
    },
    {
      name: 'utm',
      condition: () => true,
      load: async () => {
        const { initUTMTracking } = await import('./utmTracking');
        initUTMTracking();
      },
      priority: 'critical',
    },
    {
      name: 'ga4',
      condition: () => true,
      load: async () => {
        const { initGA4Tracking } = await import('./ga4');
        const cleanup = initGA4Tracking();
        return cleanup;
      },
      priority: 'critical',
    },
    {
      name: 'navigation',
      condition: () => !isMobile(),
      load: async () => {
        const { initInteractionTracking } = await import('./navigationTracking');
        const cleanup = initInteractionTracking();
        return cleanup;
      },
      priority: 'standard',
    },
    {
      name: 'enhanced',
      condition: () => !isMobile(),
      load: async () => {
        const { initEnhancedTracking } = await import('./enhancedTracking');
        const { cleanup } = initEnhancedTracking();
        return cleanup;
      },
      priority: 'standard',
    },
    {
      name: 'engagement',
      condition: () => (isHomepage() || isServicesPage()) && !isMobile(),
      load: async () => {
        const { initAdvancedEngagement } = await import('./advancedEngagement');
        const tracker = initAdvancedEngagement();
        return () => tracker?.destroy();
      },
      priority: 'low',
    },
    {
      name: 'forms',
      condition: () => hasForm(),
      load: async () => {
        const { initFormAnalytics } = await import('./formAnalytics');
        const tracker = initFormAnalytics();
        return () => tracker?.destroy();
      },
      priority: 'low',
    },
  ];

  async init(): Promise<void> {
    this.initStartTime = Date.now();

    const criticalModules = this.modules.filter(m => m.priority === 'critical' && m.condition());
    const standardModules = this.modules.filter(m => m.priority === 'standard' && m.condition());
    const lowModules = this.modules.filter(m => m.priority === 'low' && m.condition());

    await this.loadModules(criticalModules);

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadModules(standardModules).then(() => {
          requestIdleCallback(() => this.loadModules(lowModules), { timeout: 5000 });
        });
      }, { timeout: 2000 });
    } else {
      setTimeout(async () => {
        await this.loadModules(standardModules);
        setTimeout(() => this.loadModules(lowModules), 1000);
      }, 500);
    }
  }

  private async loadModules(modules: AnalyticsModule[]): Promise<void> {
    const modulesToLoad = modules.filter(m => {
      if (this.loadedModules.size >= this.maxScripts) {
        console.log(`[Analytics] Budget limit reached (${this.maxScripts} scripts)`);
        return false;
      }

      const elapsedTime = Date.now() - this.initStartTime;
      if (elapsedTime > this.maxInitTime) {
        console.log(`[Analytics] Time budget exceeded (${elapsedTime}ms > ${this.maxInitTime}ms)`);
        return false;
      }

      return true;
    });

    const results = await Promise.allSettled(
      modulesToLoad.map(module => this.loadModule(module))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Analytics] Failed to load ${modulesToLoad[index].name}:`, result.reason);
      }
    });
  }

  private async loadModule(module: AnalyticsModule): Promise<void> {
    if (this.loadedModules.has(module.name)) return;

    try {
      console.log(`[Analytics] Loading ${module.name} (${module.priority})`);
      const cleanup = await module.load();

      if (cleanup) {
        this.cleanupFunctions.set(module.name, cleanup);
      }

      this.loadedModules.add(module.name);
      console.log(`[Analytics] Loaded ${module.name}`);
    } catch (error) {
      console.error(`[Analytics] Error loading ${module.name}:`, error);
      throw error;
    }
  }

  cleanup(): void {
    this.cleanupFunctions.forEach((cleanup, name) => {
      try {
        cleanup();
        console.log(`[Analytics] Cleaned up ${name}`);
      } catch (error) {
        console.error(`[Analytics] Error cleaning up ${name}:`, error);
      }
    });

    this.cleanupFunctions.clear();
    this.loadedModules.clear();
  }
}

let analyticsLoader: ConditionalAnalyticsLoader | null = null;

export function initConditionalAnalytics(): void {
  if (analyticsLoader) {
    analyticsLoader.cleanup();
  }

  analyticsLoader = new ConditionalAnalyticsLoader();
  analyticsLoader.init();
}

export function cleanupConditionalAnalytics(): void {
  if (analyticsLoader) {
    analyticsLoader.cleanup();
    analyticsLoader = null;
  }
}
