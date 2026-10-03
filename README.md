# StudySync

A collaborative study planner: one course hub per course, with shared resources, files, and group membership.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

Sign-in is handled by [Auth.js v5](https://authjs.dev) with **OAuth only** — there is no password in the
database. Sessions are stored in a signed JWT cookie, so no session table is needed.

| File | Purpose |
| --- | --- |
| `auth.config.ts` | Config shared by the app and `proxy.ts` (no database imports) |
| `auth.ts` | Auth.js setup: Google + GitHub providers, JWT callbacks |
| `proxy.ts` | Redirects unauthenticated visitors of `/courses/*` to the sign-in screen |
| `lib/users.ts` | Finds or creates the MongoDB `User` for the OAuth profile, keyed on email |
| `lib/auth.ts` | `getSessionUser()` — resolves the Auth.js session to a MongoDB user |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js route handler (`/api/auth/*`) |

Existing users keep their courses and resources: the first OAuth sign-in matches the account by email,
so the MongoDB user id (and therefore every `ownerId`, `member.userId`, and `createdById`) stays the same.

### 1. Create an OAuth app per provider

Set the callback URL to `http://localhost:3000/` for local development:

- **Google** — [Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
  → *Create credentials → OAuth client ID → Web application*.
- **GitHub** — [Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
  → *New OAuth App*, with the homepage URL set to `http://localhost:3000`.

### 2. Fill in `.env`

```bash
npx auth secret   # generates AUTH_SECRET
```

```sh
AUTH_SECRET=<generated>
AUTH_GOOGLE_ID=<from Google>
AUTH_GOOGLE_SECRET=<from Google>
AUTH_GITHUB_ID=<from GitHub>
AUTH_GITHUB_SECRET=<from GitHub>
```

`AUTH_TRUST_HOST=true` lets Auth.js trust the host header outside of Vercel. On Vercel it is set
automatically. `NEXT_PUBLIC_SITE_URL` is only used to build absolute URLs for metadata,
`robots.txt`, and `sitemap.xml`.

## Metadata

- `app/layout.tsx` — site-wide title template, description, keywords, Open Graph, and Twitter tags.
- `app/opengraph-image.tsx` — generated 1200×630 social preview image.
- `app/courses/[courseId]/layout.tsx` — `generateMetadata()` builds a title and description from the
  course, but only for members; everyone else gets a generic, `noindex` title.
- `app/robots.ts` and `app/sitemap.ts` — file-based metadata conventions.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run lint    # ESLint
```