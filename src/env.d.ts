/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
  readonly SITE_URL?: string;
  readonly BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __lenis?: import('lenis').default;
  __DEBUG_SCROLL_LOCK?: boolean;
  __debugScrollLock?: () => { isLocked: boolean; activeLocks: string[] };
  __forceUnlockScroll?: () => void;
  __auxoBlogShareBound?: boolean;
  __auxoOfflinePageBound?: boolean;
  __auxoServiceDetailPageBound?: boolean;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

interface Document {
  startViewTransition?: (callback: () => Promise<void> | void) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
}

interface Navigator {
  userAgentData?: {
    mobile: boolean;
    brands: Array<{ brand: string; version: string }>;
    platform: string;
  };
  msMaxTouchPoints?: number;
}

interface CSSStyleDeclaration {
  webkitTapHighlightColor?: string;
}

interface Element {
  _themeListenerAttached?: boolean;
  _draftManager?: import('./scripts/forms/draftManager').DraftManager;
}

declare var gtag: ((...args: any[]) => void) | undefined;

