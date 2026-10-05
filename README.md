# Profile App — React + TypeScript + Vite

React 19 + Vite + Tailwind CSS v4 + React Router single-page app with Microsoft Entra ID
(Azure AD B2C) authentication via MSAL.

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in your B2C app registration values:
   - `VITE_AZURE_CLIENT_ID` — application (client) ID of the frontend app registration.
   - `VITE_AZURE_TENANT_NAME` — tenant name, i.e. the `<name>` in `https://<name>.b2clogin.com`.
   - `VITE_AZURE_SIGN_UP_SIGN_IN_POLICY` — user flow, e.g. `B2C_1_susi`.
   - Optional overrides: `VITE_AZURE_AUTHORITY`, `VITE_AZURE_KNOWN_AUTHORITIES`,
     `VITE_AZURE_REDIRECT_URI`, `VITE_AZURE_POST_LOGOUT_REDIRECT_URI`, `VITE_AZURE_API_SCOPE`.
3. On the app registration, add the redirect URI used by the app (defaults to
   `http://localhost:5173/`) under the **Single-page application** platform, together with the
   post-logout redirect URI.
4. Start the dev server: `npm run dev`

The app throws a descriptive error on start-up when a required `VITE_AZURE_*` variable is missing.

## Authentication

- `src/auth/authConfig.ts` reads the `VITE_AZURE_*` variables and builds the MSAL
  `Configuration` (`msalConfig`) plus the `loginRequest` / `apiRequest` scope sets.
- `src/auth/msalInstance.ts` owns the single `PublicClientApplication` instance;
  `src/App.tsx` passes it to `MsalProvider`, which calls `initialize()` and completes the
  redirect returned by B2C.
- `src/auth/AuthProvider.tsx` maps the MSAL account onto the app's `useAuth()` context:
  `user`, `isAuthenticated`, `isLoading` (MSAL still starting up / handling the redirect),
  `error`, `login()` and `logout()`.
- Sign-in and sign-out use the redirect flow: the browser leaves the SPA for the hosted B2C
  pages, then returns to the redirect URI where MSAL restores the session.
- The token cache lives in `sessionStorage` (see `msalConfig.cache`); switch it to
  `localStorage` if the session should survive a browser restart.
- Variables prefixed with `VITE_` are embedded in the browser bundle, so a SPA app
  registration must never contain a client secret.

## Available scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build
performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by
installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full
list of rules and categories.
