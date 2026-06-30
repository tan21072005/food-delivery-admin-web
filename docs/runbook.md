# Runbook

## Local Development

Use Node.js 20 or newer.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the Supabase public project values:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

   Only use the Supabase anon key in this web app. Do not add a service role key to `.env.local` or any client/server source file.

4. Start the local Next.js server:

   ```bash
   npm run dev
   ```

5. Run release checks before merging:

   ```bash
   npm run lint
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

## Offers SQL

`docs/supabase_v3_food_delivery_schema.sql` does not create `public.offers`.

Apply `docs/seller_offers_schema_rls.sql` after the v3 schema when enabling:

- `/seller/promotions`
- `/admin/offers`

The offers SQL is additive and creates the shared `public.offers` table, the `set_offers_updated_at` trigger, and RLS policies for:

- admins managing all offers
- restaurant owners managing only restaurant-scoped offers for restaurants they own
