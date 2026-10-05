# Profile App — React + TypeScript + Vite

React 19 + Vite + Tailwind CSS v4 + React Router single-page app with Microsoft Entra ID
(Azure AD) authentication via MSAL, backed by the ASP.NET Core profile API.

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Entra ID app registration values:
   - `VITE_AZURE_CLIENT_ID` — application (client) ID of the frontend app registration.
   - `VITE_AZURE_TENANT_SUBDOMAIN` — Entra External ID (CIAM) tenant subdomain, e.g.
     `contoso` for `contoso.ciamlogin.com`; builds
     `https://<value>.ciamlogin.com/<value>.onmicrosoft.com` when no explicit authority is set.
   - `VITE_AZURE_REDIRECT_URI` — must match a redirect URI on the app registration.
   - Optional overrides: `VITE_AZURE_AUTHORITY`, `VITE_AZURE_KNOWN_AUTHORITIES`,
     `VITE_AZURE_POST_LOGOUT_REDIRECT_URI`, `VITE_AZURE_API_SCOPE`, `VITE_API_BASE_URL`.
3. On the app registration, add the redirect URI used by the app (defaults to
   `http://localhost:5173/`) under the **Single-page application** platform, together with the
   post-logout redirect URI.
4. Start the dev server: `npm run dev`

The app throws a descriptive error on start-up when a required `VITE_AZURE_*` variable is missing.

## Authentication

- `src/auth/authConfig.ts` reads the `VITE_AZURE_*` variables and builds the MSAL
  `Configuration` (`msalConfig`) plus the `loginRequest` / `apiRequest` scope sets.
- CIAM note: with a name-based authority (`https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com`)
  the OIDC discovery document returns a GUID-based issuer, so `VITE_AZURE_KNOWN_AUTHORITIES`
  must list both hosts (`<tenant>.ciamlogin.com,<tenant-id>.ciamlogin.com`). Otherwise MSAL fails
  issuer validation and the sign-in reports `endpoints_resolution_error`.
- `src/auth/msalInstance.ts` owns the single `PublicClientApplication` instance;
  `src/App.tsx` passes it to `MsalProvider`, which calls `initialize()` and completes the
  redirect returned by Entra ID.
- `src/auth/AuthProvider.tsx` maps the MSAL account onto the app's `useAuth()` context:
  `user`, `isAuthenticated`, `isLoading` (MSAL still starting up / handling the redirect),
  `error`, `login()` and `logout()`.
- Sign-in and sign-out use the redirect flow: the browser leaves the SPA for the hosted
  Microsoft Entra ID pages, then returns to the redirect URI where MSAL restores the session.
- The token cache lives in `sessionStorage` (see `msalConfig.cache`); switch it to
  `localStorage` if the session should survive a browser restart.
- Variables prefixed with `VITE_` are embedded in the browser bundle, so a SPA app
  registration must never contain a client secret.

## Backend API

The Profile page loads the saved profile from the backend (`GET /api/Profile`) with a Bearer
token once `VITE_AZURE_API_SCOPE` is set; the token is acquired silently with MSAL and the
same Entra ID tenant validates it on the API side. The API base URL comes from
`VITE_API_BASE_URL` and defaults to `http://localhost:5290`. Without an API scope the app
still works and shows the MSAL session only.

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
