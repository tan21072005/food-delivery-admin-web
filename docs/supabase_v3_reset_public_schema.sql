-- Reset public schema before applying Food Delivery v3 schema.
-- WARNING: This deletes all tables, views, functions, triggers, policies, and data in public.
-- It does NOT delete Supabase Auth users in auth.users.
-- Recommended order:
--   1. Backup/export any important data.
--   2. Run this file in Supabase SQL Editor.
--   3. Run docs/supabase_v3_food_delivery_schema.sql.
--   4. Run docs/supabase_v3_food_delivery_seed.sql.

drop schema if exists public cascade;

create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public
grant all on tables to postgres, service_role;

alter default privileges in schema public
grant all on routines to postgres, service_role;

alter default privileges in schema public
grant all on sequences to postgres, service_role;

-- Keep common extensions outside public where Supabase normally installs them.
create extension if not exists pgcrypto with schema extensions;

