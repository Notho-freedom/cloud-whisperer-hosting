# Hostiq

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.x-FF4154)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-payments-635BFF?logo=stripe&logoColor=white)

**Hostiq** is the current product identity exposed by this repository: a full-stack web hosting control plane intended to bring domains, hosting and professional email management into one console.

The repository name remains `cloud-whisperer-hosting`.

## Product surface

The current application contains an authenticated web console with areas for hosting-oriented operations and administration, including:

- Domains
- Sites
- Email
- Hosting/provider configuration
- Plans and billing
- API logs
- Audit history
- Announcements and blog content
- Settings
- Admin operations

The application is built around API-backed workflows rather than a traditional single-server hosting implementation.

## Architecture

The frontend uses TanStack Start and TanStack Router, with React Query for server-state handling. Authentication is provided through the application's auth layer and backend integrations. Stripe is included for billing/payment workflows, while Supabase is used as a backend integration.

```text
Browser
  │
  ▼
Hostiq web console
  │
  ├── TanStack Start / Router
  ├── React Query
  ├── Auth layer
  ├── Hosting/domain/email APIs
  └── Billing / Stripe integration
```

## Tech stack

- **React 19**
- **TypeScript 5**
- **TanStack Start / TanStack Router**
- **Vite 7**
- **Tailwind CSS 4**
- **Supabase**
- **Stripe**
- **TanStack Query**
- **Zod**
- **Radix UI**

## Local development

### Requirements

- Node.js
- npm or Bun

### Install

```bash
npm install
```

### Start development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Quality checks

```bash
npm run lint
npm run format
```

## Environment configuration

The application uses environment-backed integrations for its backend and external services. Create a local `.env` from the variables expected by the application and keep credentials out of source control.

**Never commit real provider keys, Stripe secrets, Supabase service-role keys, or other credentials.**

## Project structure

```text
src/
├── api/            # API-facing code
├── components/     # UI components
├── hooks/          # React hooks
├── integrations/   # External service integrations
├── lib/            # Auth and shared application logic
└── routes/         # TanStack Start routes

supabase/           # Backend configuration/migrations
```

## Status

This repository is an active product codebase/prototype. The UI and route structure cover a broad hosting-console surface; individual provider integrations and production operational guarantees should be validated independently before treating the project as a production hosting platform.

## Security note

Because this is a public repository, environment files and credentials must be treated as sensitive. Keep `.env` files local/ignored and rotate any credential that has ever been committed publicly.

## License

No explicit license file was identified in the current repository. Treat the project as **all rights reserved** unless a license is added.