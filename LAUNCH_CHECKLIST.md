# NammaSpot Launch Checklist

A comprehensive checklist for deploying NammaSpot to production and verifying all functionality.

## Pre-Launch: Code & Build

- [x] **Fix deprecated API calls** — Replaced `inputValidator()` with `validator()` in all server functions
- [x] **TypeScript compilation** — No type errors, builds successfully
- [x] **Production build** — `npm run build` completes without errors
- [x] **No console errors** — Browser DevTools shows no critical errors
- [ ] **Environment variables documented** — `.env.example` includes all required vars
- [x] **Deployment guide created** — `DEPLOYMENT.md` explains step-by-step setup

## Infrastructure Setup

### Supabase Project
- [ ] **Create Supabase project** — https://supabase.com
- [ ] **Get API keys** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Run database migrations** — Create `sellers`, `products`, `categories`, `reviews`, `enquiries`, `customers` tables
- [ ] **Create storage buckets** — `seller-avatars`, `product-images`, `story-images` (all public read)
- [ ] **Configure RLS policies** — Ensure sellers can only access their own data
- [ ] **Test Supabase connection** — Verify API keys work

### Google Sheets Integration (Optional)
- [ ] **Create Google Sheet** — "NammaSpot Data" with tabs for each table
- [ ] **Set up Apps Script** — Implement `doGet` handler for reading
- [ ] **Deploy as Web App** — Public access, get deployment URL
- [ ] **Set SHEETS_API_BASE** — Store the Google Apps Script URL
- [ ] **Test read endpoint** — Verify data loads correctly

### Vercel Deployment
- [ ] **Connect GitHub repository** — Link NammaSpot repo to Vercel
- [ ] **Set environment variables** — Add all Supabase and config vars to Vercel
- [ ] **Configure build command** — Should be `npm run build` (already set in vercel.json)
- [ ] **First deployment** — Allow Vercel to build and deploy automatically
- [ ] **Check deployment URL** — Should be live and accessible

## Pre-Launch: Feature Testing

### Homepage (`/`)
- [ ] **Hero section loads** — Images display, no broken layout
- [ ] **Featured sellers section** — Shows 4 featured sellers or empty state
- [ ] **Categories section** — All 8 categories visible
- [ ] **Search box works** — Can type and navigate to explore page
- [ ] **Category links work** — Clicking a category filters explore view
- [ ] **Mobile responsive** — Looks good on phone (320px width)
- [ ] **Page performance** — Loads in <3 seconds

### Explore Page (`/explore`)
- [ ] **Search works** — Typing filters sellers by name/product
- [ ] **Category filter works** — Selecting category filters results
- [ ] **Area filter works** — Selecting area filters results
- [ ] **Rating filter works** — Min rating slider works
- [ ] **Price filter works** — Max price input works
- [ ] **Skeleton loading** — Shows while data loads
- [ ] **Empty state** — Shows when no results match filters
- [ ] **Sort options work** — Sorts by rating, views, or newest

### Seller Profile (`/seller/:slug`)
- [ ] **Profile loads** — Seller avatar, name, category, rating visible
- [ ] **About section** — Bio and Instagram link display
- [ ] **Products section** — Shows seller's products in grid
- [ ] **Enquiry form** — Customer can fill in and submit enquiry
- [ ] **Error state** — Shows "Seller not found" if invalid slug
- [ ] **Mobile layout** — Responsive on small screens

### Seller Registration (`/seller/register`)
- [ ] **Form loads** — All fields visible
- [ ] **Avatar upload works** — Can pick photo, preview shows
- [ ] **Category select works** — Can choose from dropdown
- [ ] **Form validation** — Required fields enforced
- [ ] **Submit creates account** — New seller created in Supabase
- [ ] **Redirect to dashboard** — After registration, redirected to seller dashboard
- [ ] **Confirmation email sent** — Check Supabase email auth settings

### Seller Login (`/seller/login`)
- [ ] **Login form works** — Can enter username and password
- [ ] **Invalid creds rejected** — Shows error message
- [ ] **Valid login succeeds** — Redirects to dashboard
- [ ] **Session persists** — Staying logged in after page refresh

### Seller Dashboard (`/seller/dashboard`)
- [ ] **Overview tab loads** — Shows analytics chart
- [ ] **My Business tab** — Can edit profile and upload avatar
- [ ] **Catalogue tab** — Can add, edit, delete products
- [ ] **Enquiries tab** — Shows customer enquiries
- [ ] **Customers tab** — Lists recent customers
- [ ] **Instagram tab** — Links to seller's Instagram
- [ ] **Analytics tab** — Shows mock data
- [ ] **Settings tab** — Shows logout button
- [ ] **Mobile layout** — Sidebar collapses on small screens

### Admin Console (`/admin`)
- [ ] **Password prompt shows** — When accessing `/admin`
- [ ] **Invalid password rejected** — Shows error
- [ ] **Valid password grants access** — Can enter admin dashboard
- [ ] **Approval queue loads** — Shows pending sellers
- [ ] **Approve seller works** — Status changes to "approved"
- [ ] **Reject seller works** — Status changes to "rejected"
- [ ] **Sellers list shows avatars** — Seller profile pictures visible
- [ ] **Products tab shows** — All products in system
- [ ] **Reviews tab shows** — All reviews for moderation
- [ ] **Enquiries tab shows** — All customer enquiries
- [ ] **Session timeout works** — After 4 hours, logged out automatically

### Other Pages
- [ ] **Categories page (`/categories`)** — Lists all categories with descriptions
- [ ] **Featured page (`/featured`)** — Shows featured sellers
- [ ] **Stories page (`/stories`)** — Shows stories/testimonials
- [ ] **Near Me page (`/near-me`)** — Shows sellers near user's location
- [ ] **404 page** — Shows for invalid routes
- [ ] **Error page** — Shows for server errors

## Database & API Testing

### Supabase
- [ ] **Sellers table** — Can read and write seller records
- [ ] **Products table** — Can add products for a seller
- [ ] **Reviews table** — Can read reviews, write reviews visible to admin
- [ ] **Enquiries table** — New enquiries saved to DB
- [ ] **Auth working** — Sellers can sign up and log in via Supabase
- [ ] **Storage working** — Images upload to buckets and retrieve via proxy

### Image Handling
- [ ] **Seller avatar uploads** — Upload, compress, store to `seller-avatars` bucket
- [ ] **Product images upload** — Upload multiple, resize, store to `product-images` bucket
- [ ] **Image proxy works** — `/api/public/media/` serves images correctly
- [ ] **Broken images handled** — Shows fallback if image missing
- [ ] **Image caching** — Browser caches images (Cache-Control header set)

## Performance & SEO

- [ ] **Meta tags set** — Title, description on all pages
- [ ] **OG tags present** — og:title, og:description for sharing
- [ ] **Mobile friendly** — Responsive design works on all sizes
- [ ] **Page speed** — Core Web Vitals green on Lighthouse
- [ ] **No console warnings** — Browser console clean
- [ ] **No unused dependencies** — Build is optimized
- [ ] **Sitemap.xml generated** — `/sitemap.xml` accessible

## Security

- [ ] **Admin password protected** — ADMIN_PASSWORD never in source code
- [ ] **Supabase service key protected** — SUPABASE_SERVICE_ROLE_KEY server-only
- [ ] **Public key in code** — VITE_SUPABASE_PUBLISHABLE_KEY only for frontend
- [ ] **HTTPS enforced** — All traffic encrypted
- [ ] **RLS policies active** — Database access controlled by auth
- [ ] **No secrets in GitHub** — Verify `.gitignore` blocks `.env`
- [ ] **Image validation** — Only images accepted, max size enforced
- [ ] **Input validation** — All forms validated before processing

## Monitoring & Support

- [ ] **Vercel monitoring enabled** — Check Vercel dashboard for errors
- [ ] **Error logging** — Browser errors tracked (if using Sentry/similar)
- [ ] **Performance monitoring** — Track page load times
- [ ] **Uptime monitoring** — Set up health checks
- [ ] **Support email configured** — Contact form works
- [ ] **Documentation complete** — README, DEPLOYMENT.md, this checklist

## Post-Launch: First Week

- [ ] **Daily health checks** — Verify all pages load
- [ ] **Monitor error logs** — Fix any reported issues
- [ ] **User feedback** — Collect feedback from initial users
- [ ] **Performance review** — Check Lighthouse scores
- [ ] **Database backup** — Verify Supabase backups running
- [ ] **Analytics setup** — Install GA/Mixpanel if desired

## Optional Enhancements (Post-Launch)

- [ ] **Email notifications** — Seller gets email when enquiry received
- [ ] **SMS notifications** — WhatsApp/SMS for enquiries
- [ ] **Search optimization** — Full-text search on product names
- [ ] **Image optimization** — Cloudinary/Imgix CDN integration
- [ ] **Payment integration** — Stripe for featured listings or commissions
- [ ] **Blog/Content** — Seller stories, maker spotlights
- [ ] **Mobile app** — Native iOS/Android apps
- [ ] **Internationalization** — Tamil language support

## Rollback Plan

If critical issues discovered after launch:

1. **Identify the issue** — Check Vercel logs and Supabase
2. **Check previous deployments** — Vercel keeps deployment history
3. **Roll back** — Click "Rollback to this" on previous deployment
4. **Fix locally** — Reproduce issue, test fix, commit to GitHub
5. **Re-deploy** — Vercel automatically deploys on push to main

## Success Criteria

✅ All checklist items completed  
✅ No critical errors in production  
✅ All user flows working end-to-end  
✅ Admin can approve/manage sellers  
✅ Sellers can upload products and avatars  
✅ Customers can view sellers and send enquiries  
✅ Page loads in <3 seconds  
✅ Mobile responsive on all screen sizes  

---

**Launch Date:** TBD  
**Status:** Ready for Deployment  
**Last Updated:** October 3, 2026
