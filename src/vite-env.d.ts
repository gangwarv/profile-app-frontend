/// <reference types="vite/client" />

/**
 * Vite exposes every variable prefixed with `VITE_` through `import.meta.env`.
 * The values are read (and validated) in `src/auth/authConfig.ts`.
 */
interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID?: string
  readonly VITE_AZURE_TENANT_NAME?: string
  readonly VITE_AZURE_SIGN_UP_SIGN_IN_POLICY?: string
  readonly VITE_AZURE_AUTHORITY?: string
  readonly VITE_AZURE_KNOWN_AUTHORITIES?: string
  readonly VITE_AZURE_REDIRECT_URI?: string
  readonly VITE_AZURE_POST_LOGOUT_REDIRECT_URI?: string
  readonly VITE_AZURE_API_SCOPE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
