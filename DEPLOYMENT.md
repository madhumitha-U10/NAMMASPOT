# NammaSpot Deployment Guide

## Overview
NammaSpot is a full-stack marketplace platform for Chennai's local artisans and makers, built with TanStack Start, React, TypeScript, and Supabase.

**Tech Stack:**
- **Frontend:** React 19, TypeScript, Tailwind CSS, Radix UI
- **Server:** TanStack Start with Nitro (SSR/API)
- **Database:** Supabase (PostgreSQL)
- **Data Source:** Google Sheets (via Apps Script Web App)
- **Deployment:** Vercel (serverless)
- **Storage:** Supabase Storage (images)

## Prerequisites

Before deploying to production, ensure you have:

1. **GitHub Account** - Repository with NammaSpot code
2. **Vercel Account** - For hosting the app
3. **Supabase Account** - For database, authentication, and image storage
4. **Google Account** - For Sheets integration (optional but recommended for data)
5. **Node.js 18+** - For local development and builds

## Step 1: Supabase Setup

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project:
   - **Name:** nammaspot-production (or your preference)
   - **Database Password:** Use a strong, unique password (store in 1Password/vault)
   - **Region:** Choose closest to Chennai (Asia: Singapore recommended)
3. Wait for initialization (~2 minutes)

### Get API Keys
1. Go to **Settings → API**
2. Copy these values (you'll need them for environment setup):
   - `SUPABASE_URL` (anon public endpoint)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (anon public key, safe for frontend)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server-only)

### Set Up Database Schema
Run the migrations from the `supabase/migrations/` folder:
1. Open Supabase SQL Editor
2. Import each migration in order (look for `001_`, `002_`, etc.)
3. Verify tables are created:
   - `sellers`
   - `seller_accounts`
   - `products`
   - `reviews`
   - `enquiries`
   - `categories`

### Set Up Storage Buckets
Create these public storage buckets in Supabase:
1. **seller-images** - Profile photos for sellers
2. **product-images** - Product/service images
3. Set all to **Public** bucket (read access is public)

## Step 2: Google Sheets Setup (Optional but Recommended)

### Create Google Sheets Workbook
1. Create a new Google Sheet named "NammaSpot Data"
2. Create tabs named:
   - `sellers` — Seller information
   - `products` — Product/service listings
   - `categories` — Service categories
   - `enquiries` — Customer enquiries
   - `reviews` — Seller reviews
   - `customers` — Customer info (optional)

### Set Up Google Apps Script
1. **Tools → Script Editor**
2. Add `Code.gs` with GET handler for reading data
3. Optional: Add `doPost` for writing data (backend updates)
4. **Deploy as Web App**:
   - Execute as: Your account
   - Who has access: Anyone
5. Copy the Web App deployment URL
6. Save to: `SHEETS_API_BASE` env variable

## Step 3: Environment Variables Setup

### Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Do NOT click "Deploy" yet — configure environment first

### Configure Environment Variables
1. In Vercel project settings → **Environment Variables**
2. Add variables for **Production** environment:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1... (KEEP SECRET!)
ADMIN_PASSWORD=your_secure_admin_password
SHEETS_API_BASE=https://script.google.com/macros/d/...
SHEETS_WRITE_TOKEN=your_optional_write_token
```

### Local Development Setup
1. Copy `.env.example` to `.env.local`
2. Fill in values (use test/dev values, not production)
3. Run `npm install && npm run dev`
4. Test at `http://localhost:5173`

## Step 4: Build & Test

### Local Build Test
```bash
npm run build          # Build for production
npm run lint          # Check code quality (may timeout, skip if needed)
npm run preview       # Preview production build locally
```

### Verify Build
- Check `.vercel/output/` folder exists
- No build errors in the output
- All assets compiled successfully

## Step 5: Deploy to Vercel

### First Deployment
1. Vercel will automatically deploy when you connect the GitHub repo
2. Monitor the build in Vercel Dashboard
3. Once complete, you'll get a production URL (nammaspot-[xxxx].vercel.app)

### Testing Deployment
1. Visit your production URL
2. Test user flows:
   - **Homepage** → loads hero images, categories, featured sellers
   - **Explore** → search and filter sellers
   - **Seller profile** → view products and send enquiry
   - **Seller registration** → create new seller account
   - **Seller dashboard** → manage profile and products
   - **Admin console** (`/admin`) → approve sellers, moderate reviews

## Step 6: Custom Domain (Optional)

1. In Vercel project → **Settings → Domains**
2. Add your domain (e.g., nammaspot.in)
3. Update DNS records:
   - `A` record → `76.76.19.161` (Vercel default)
   - `CNAME` → `cname.vercel.com` (optional, for www)

## Monitoring & Maintenance

### Health Checks
- **Weekly:** Test all user flows in production
- **Monthly:** Review Vercel logs for errors
- **Monthly:** Audit Supabase metrics (storage, bandwidth)

### Scaling Considerations
- **Images:** Monitor Supabase storage usage (has limits on free plan)
- **Database:** Check Supabase connection limits if >1000 concurrent users
- **Requests:** Vercel has unlimited serverless functions

### Backup Strategy
- **Supabase:** Backups available in Plan Settings
- **Sheets:** Google Sheets has automatic version history
- **Code:** GitHub is your code backup

## Troubleshooting

### Deployment Won't Build
1. Check Vercel logs for specific error
2. Run `npm run build` locally to replicate
3. Most common: Missing environment variable
4. Verify all `process.env["KEY"]` variables are set in Vercel

### Supabase Connection Errors
1. Verify `SUPABASE_URL` and keys are correct (check for typos)
2. Ensure Supabase project is not paused (check billing)
3. Check network connectivity in Vercel logs
4. Verify RLS (Row Level Security) policies allow access

### Images Not Loading
1. Check Supabase Storage bucket is **Public**
2. Verify image URLs use `/api/public/media/` proxy path
3. Check Supabase Storage rules allow read access

### Admin Console Not Accessible
1. Verify `ADMIN_PASSWORD` is set in Vercel
2. Check browser localStorage for admin token
3. Ensure session hasn't expired (4 hour TTL)

## Emergency Rollback

If a deployment breaks production:
1. Go to Vercel Dashboard → **Deployments**
2. Find the last known-good deployment
3. Click "**...**" → **Rollback to this**
4. Vercel will instantly revert to that version

## Performance Optimization

### Current Status
- Large bundle chunks (500+ kB) — consider code-splitting Recharts
- All images cached server-side for 3 minutes
- Database queries use connection pooling

### Recommended Optimizations (Future)
- Migrate from Recharts to a lighter chart library
- Implement image CDN (Cloudinary/Imgix)
- Add Redis caching layer
- Optimize bundle with dynamic imports

## Security Checklist

- [x] `ADMIN_PASSWORD` only in server env vars (not exposed to browser)
- [x] `SUPABASE_SERVICE_ROLE_KEY` only in server env vars
- [x] Public Supabase key (`VITE_SUPABASE_PUBLISHABLE_KEY`) used for frontend
- [x] RLS policies enforce seller/admin access control
- [x] Seller auth via Supabase JWT tokens
- [x] Image uploads validated server-side
- [x] ADMIN_PASSWORD validated with HMAC signatures
- [x] No secrets committed to GitHub (check `.gitignore`)

## Next Steps

1. **Complete:** Run `npm run build && npm run preview` locally
2. **Complete:** Configure Vercel environment variables
3. **Complete:** Deploy and test all user flows
4. **Complete:** Set up custom domain
5. **Complete:** Configure monitoring/alerts
6. **Complete:** Document admin procedures (seller approval workflow)
7. **Complete:** Train staff on admin console

## Support

For issues or questions:
1. Check Vercel Logs (Deployments tab)
2. Check Supabase SQL Editor for data issues
3. Check browser DevTools Console for client errors
4. Review this guide's Troubleshooting section

---

**Last Updated:** October 3, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
