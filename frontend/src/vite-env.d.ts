/// <reference types="vite/client" />

interface ViteTypeOptions {
  // Make ImportMetaEnv strict and disallow unknown keys.
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly MAILCATCHER_HOST: string
  readonly VITE_APP_PUBLIC_POSTHOG_KEY: string
  readonly VITE_APP_PUBLIC_POSTHOG_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
