# Runbook

## Offers SQL

`docs/supabase_v3_food_delivery_schema.sql` does not create `public.offers`.

Apply `docs/seller_offers_schema_rls.sql` after the v3 schema when enabling:

- `/seller/promotions`
- `/admin/offers`

The offers SQL is additive and creates the shared `public.offers` table, the `set_offers_updated_at` trigger, and RLS policies for:

- admins managing all offers
- restaurant owners managing only restaurant-scoped offers for restaurants they own
