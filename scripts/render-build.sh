#!/usr/bin/env bash
# ==============================================================================
# Render Build & Database Migration Script
# ==============================================================================
set -o errexit

echo "🚀 [Render Build] Preparing Prisma schema according to DATABASE_URL..."
node scripts/prepare-prisma.mjs

echo "📦 [Render Build] Generating Prisma Client..."
npx prisma generate

echo "🏗️ [Render Build] Building Next.js application..."
npm run build

echo "🗄️ [Render Build] Synchronizing database schema..."
npx prisma db push --accept-data-loss

echo "🌱 [Render Build] Seeding Bangladesh geographic dataset and initial demo records..."
node scripts/seed.mjs

echo "✅ [Render Build] Build and database setup successfully completed!"
