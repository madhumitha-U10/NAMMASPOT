# NammaSpot

NammaSpot is a mobile-first local seller discovery and digital catalogue MVP.

## Current implementation
- Customer homepage, search, categories and saved sellers
- Public seller catalogue pages
- Shareable seller URLs using hash routes
- Seller registration form with local draft persistence
- Responsive mobile/tablet/desktop UI
- Accessible labels, clear loading/error/empty-friendly states

## Important backend note
This repository currently has no connected Supabase/Google Sheets project in the available environment. Seller registration and saved sellers therefore use browser-local storage only and are **not a production multi-user backend**. Do not treat local registration as real seller onboarding until a production database/auth service is connected.

## Run
npm install
npm run build
npm run dev

## Production integration checklist
1. Connect Supabase or the existing server backend.
2. Add server-side authentication and ownership checks.
3. Persist sellers/products/enquiries in the database with RLS/authorization.
4. Configure production environment variables in Vercel.
5. Add real image storage and QR generation after backend connection.
