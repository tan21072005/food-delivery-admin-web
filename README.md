# Food Delivery Admin Web

Next.js App Router foundation for the food delivery admin and seller portals.

## Getting Started

Create a local environment file from `.env.example`:

```sh
cp .env.example .env.local
```

Fill in:

```sh
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then run:

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/login`
- `/seller/dashboard`
- `/admin/dashboard`

Additional placeholder routes are present for the next feature branches:

- `/seller/restaurant`
- `/seller/menus`
- `/seller/orders`
- `/admin/restaurants`
- `/admin/users`
- `/admin/orders`
- `/admin/categories`

## Auth Roles

The proxy guard reads `user.app_metadata.role` from Supabase Auth.

- `admin` can access `/admin/*`
- `seller` and `restaurant` can access `/seller/*`
- `customer` and unknown roles cannot access dashboards

Do not store authorization roles in `user_metadata`, and never expose a Supabase `service_role` key in the browser.
