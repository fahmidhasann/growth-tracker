import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    '';
}

if (!process.env.POSTGRES_PRISMA_URL) {
  console.error('Missing database env. Set POSTGRES_PRISMA_URL (or DATABASE_URL) in .env.local or .env.');
  process.exit(1);
}

const prismaArgs = process.argv.slice(2);
if (!prismaArgs.length) {
  console.error('No Prisma command provided. Example: node scripts/prisma-env.mjs db push');
  process.exit(1);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
