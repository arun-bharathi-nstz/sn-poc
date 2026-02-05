#!/usr/bin/env ts-node
/**
 * RLS Migration Script
 *
 * This script applies RLS policies to the database.
 * Run this after your initial database migration:
 *
 * Usage:
 *   npx ts-node src/rls/migrate-rls.ts
 *
 * Or with environment variables:
 *   DB_HOST=localhost DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=secret npx ts-node src/rls/migrate-rls.ts
 */

import "dotenv/config";
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const user = process.env.DB_USERNAME || 'postgres';
const db = process.env.DB_NAME || 'supplynow';
const password = process.env.DB_PASSWORD || '';

const env = { ...process.env };
if (password) {
  env.PGPASSWORD = password;
}

console.log('Reading RLS SQL file...');
const rlsSqlPath = path.join(__dirname, 'rls-policies.sql');

console.log('Applying RLS policies...');
try {
  execSync(
    `psql -h "${host}" -p "${port}" -U "${user}" -d "${db}" -f "${rlsSqlPath}"`,
    { env, stdio: 'inherit' }
  );
  console.log('RLS migration completed successfully!');
} catch (error) {
  console.error('RLS migration failed:', error);
  process.exit(1);
}
