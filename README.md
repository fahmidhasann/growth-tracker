<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/570425ef-adab-41fe-9cfb-e8d693dc6c05

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Setup (Vercel Postgres + Prisma)

1. Create a Vercel Postgres database in your Vercel project.
2. Copy `POSTGRES_PRISMA_URL` into your local `.env.local`.
3. Generate Prisma client:
   `npm run db:generate`
4. Push schema to database:
   `npm run db:push`
5. Start app:
   `npm run dev`

## Authentication on Vercel (Simplest Path)

This app already has **built-in owner authentication** (email/password) and optional Google OAuth.

### What Vercel provides

Vercel provides **deployment protection**, not full app user management:

- **Vercel Authentication** (available on all plans): requires Vercel login + access to your project
- **Password Protection** (Enterprise, or Pro with Advanced Deployment Protection add-on)
- **Trusted IPs** (Enterprise)

### Recommended for this app

1. Keep the app's built-in owner login enabled (already in this codebase).
2. Keep `ENABLE_GOOGLE_OAUTH=false` to make email/password the primary authentication path.
3. If Google OAuth feels complex, leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` unset.
   - The app will use email/password only.
4. Optionally add Vercel Deployment Protection as an extra outer gate.

### Database note

The project uses PostgreSQL via `POSTGRES_PRISMA_URL` in Prisma. On Vercel, Postgres is provided through Marketplace integrations (for example Neon), with env vars injected into your project.

## Vercel CLI Quick Workflow

1. Log in and link project:
   - `npx vercel login`
   - `npx vercel link`
2. Pull Vercel env vars to local:
   - `npx vercel env pull .env.local`
3. Run Prisma against that env:
   - `npm run db:generate`
   - `npm run db:push`
4. Deploy:
   - Preview: `npx vercel`
   - Production: `npx vercel --prod`

## Deploy Workflow (Simple)

1. Make changes in your IDE.
2. Push to GitHub branch.
3. Open Pull Request (Vercel preview is created automatically).
4. Merge to `main` to trigger production deploy.

## Google OAuth Setup (Optional)

First set `ENABLE_GOOGLE_OAUTH=true`.

1. Create OAuth Client in Google Cloud Console (Web application).
2. Add authorized redirect URI:
   `https://<your-domain>/api/auth?action=google_callback`
   Example: `https://growth-tracker-gamma.vercel.app/api/auth?action=google_callback`
3. In Vercel project environment variables, set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `APP_URL` (your production app URL)
4. Redeploy production.

When these are configured, the auth screen automatically shows **Continue with Google**.
