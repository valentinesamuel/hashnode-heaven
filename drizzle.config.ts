import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './supabase/migrations',
  schema: './supabase/db/schemas',
  dialect: 'postgresql',
});
