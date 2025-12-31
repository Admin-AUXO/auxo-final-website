/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
  readonly SITE_URL?: string;
  readonly BASE_PATH?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly SANITY_API_VERSION?: string;
  readonly SANITY_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

