/// <reference types="vite/client" />

/**
 * Vite exposes every variable prefixed with `VITE_` through `import.meta.env`.
 * The values are read (and validated) in `src/auth/authConfig.ts`.
 */
interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID?: string
  readonly VITE_AZURE_TENANT_SUBDOMAIN?: string
  readonly VITE_AZURE_AUTHORITY?: string
  readonly VITE_AZURE_KNOWN_AUTHORITIES?: string
  readonly VITE_AZURE_REDIRECT_URI?: string
  readonly VITE_AZURE_POST_LOGOUT_REDIRECT_URI?: string
  readonly VITE_AZURE_API_SCOPE?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
