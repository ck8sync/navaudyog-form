/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Logo path, e.g. /assets/logo.svg (file in public/assets) or a full https URL. Optional. */
  readonly VITE_LOGO_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
