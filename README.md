# NammaSpot

**Namma Ooru. Namma People. Namma Spot.**

NammaSpot is a mobile-first **local seller discovery + digital catalogue platform**. It helps local sellers get a simple digital presence and lets customers discover, save, share and enquire without turning the MVP into a large e-commerce marketplace.

## Product flows

### Customer
- Chennai-local homepage with search and category discovery
- Explore/search sellers and products
- Category pages
- Featured sellers
- Nearby/Chennai filter
- Public seller catalogue at `/s/:sellerId`
- Save/unsave sellers
- Call, WhatsApp, Instagram and seller-provided location link
- Product enquiry form
- Seller-specific metadata, canonical URL and LocalBusiness JSON-LD

### Seller
- Email/password seller registration
- New accounts enter **pending** verification state
- Seller login
- Seller dashboard
- Edit seller profile, contact, location and opening hours
- Product create/read/update/delete
- Availability toggle
- Product image URL or Supabase Storage upload
- Enquiry inbox and status updates
- Shareable public seller URL
- QR code generated from the real public seller URL

### Admin
- Authenticated admin route
- Seller approval / rejection / suspension
- Category add / rename / delete
- Database-side authorization through Supabase RLS

## Backend

The repository is prepared for Supabase.

Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Database schema + policies:
- `supabase/migrations/0001_nammaspot_mvp.sql`

The production database contains the core relational model:
Users, Sellers, Categories, Products, Enquiries, Admins, and Favourites.

It also uses:
- primary/foreign keys
- unique constraints
- check constraints
- indexes
- timestamps
- seller verification states
- seller/product ownership RLS
- enquiry access controls
- favourite ownership
- protected admin operations
- seller media storage policies
- role-escalation protection

The unused legacy `seller_accounts` table and unused public SECURITY DEFINER slug-check function were removed during production hardening.

**Demo mode:** when Supabase is not configured, NammaSpot runs as a device-local interactive MVP. This mode is intentionally separate from production authentication/database infrastructure.

## Frontend safety

- No real secrets are stored in the repository.
- `.env`, local environment files, `.vercel` and build output are ignored.
- Public seller data is restricted to approved sellers when Supabase is active.
- The client only uses the Supabase publishable/anonymous key.
- Admin and ownership rules are enforced by database RLS, not hidden UI buttons.

## Deployment

Vercel SPA routing and security headers are configured in `vercel.json`.

GitHub Actions CI is configured in `.github/workflows/ci.yml` and the production deployment workflow runs:
- npm install
- npm run lint
- npm run build
- Vercel production deployment

## Local checks

```bash
npm install
npm run lint
npm run build
npm run dev
```

For production multi-user operation, connect the production Supabase project and set the two Vercel environment variables above.
