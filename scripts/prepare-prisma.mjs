import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const dbUrl = (process.env.DATABASE_URL || '').trim();
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

let schema = fs.readFileSync(schemaPath, 'utf8');

if (isPostgres) {
  console.log('[Prisma Config] Detected PostgreSQL DATABASE_URL. Configuring datasource provider to "postgresql"...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
} else {
  console.log('[Prisma Config] Using SQLite datasource provider ("sqlite")...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  if (!dbUrl) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('[Prisma Config] Prisma schema configured successfully.');
