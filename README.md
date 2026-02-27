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

## Deploy Workflow (Simple)

1. Make changes in your IDE.
2. Push to GitHub branch.
3. Open Pull Request (Vercel preview is created automatically).
4. Merge to `main` to trigger production deploy.
