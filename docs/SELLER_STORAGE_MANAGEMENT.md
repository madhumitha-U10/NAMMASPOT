# NammaSpot seller storage management

## Current implementation

The storage administration UI is in the existing private admin console under **Seller Storage Management**. It uses the connected Supabase project and the existing `seller-media` bucket.

### Limits and units

All plan limits are stored as integer bytes using decimal units consistently: **1 MB = 1,000,000 bytes; 1 GB = 1,000,000,000 bytes**.

- Small: 25,000,000 bytes total; 1,000,000 bytes per image.
- Medium: 75,000,000 bytes total; 1,500,000 bytes per image.
- Large: 150,000,000 bytes total; 2,000,000 bytes per image.
- Custom: admin-entered total and per-image limits.
- The Storage bucket has a 10,000,000-byte technical ceiling per object; per-seller RLS policy checks the assigned limit before object metadata is committed.

The existing seller at migration time was assigned Custom at 52,428,800 bytes (50 MiB) total and 512,000 bytes per image to preserve its previous limits and files. New seller rows receive Small by default. No files are deleted when a seller is downgraded.

## Enforcement

- `private.seller_storage_object_insert_allowed` is called by the Storage INSERT RLS policy.
- `private.seller_storage_object_update_allowed` is called by the Storage UPDATE RLS policy to validate replacements against the net usage.
- Both helpers verify the authenticated user's folder, check the assigned plan, and serialize final object commits using a transaction-scoped lock on `public.storage_guard`. This is the final enforcement point; the client-side RPC is only a preflight.
- Actual usage is calculated from `storage.objects.metadata->>'size'` for all objects in the `seller-media` bucket, including profile, cover, primary product and gallery images.
- Sellers cannot write their own plan assignments, plan definitions, audit rows or platform settings. Admin RPCs check membership in `public.admins` server-side.
- Upload failures initiated through the app are recorded in `public.seller_storage_events`. Storage API requests that bypass the app and are rejected by RLS cannot reliably create a client-side event.
- Deleting a product, gallery image, or replacing profile/cover images removes owned media where possible so the used-byte total falls from the actual object list.

## Admin capabilities

- Search sellers by business name, NammaSpot ID, or seller UUID.
- Filter by plan and usage; see usage percentage, bytes, remaining quota, file count, per-image maximum, and last plan change.
- Assign Small, Medium, Large or per-seller Custom, with confirmation and reason.
- Edit shared Small/Medium/Large limits without source changes.
- Configure a platform storage planning allowance and 70/85/95-style warning thresholds.
- Inspect stored object metadata, seller plan audit history, shared plan configuration history and recorded upload events.

## Database migrations applied

The connected Supabase project records these storage-management migrations:

- `20261011045254 prepare_seller_storage_usage_signature`
- `20261011045320 admin_controlled_seller_storage_management`
- `20261011045332 enforce_storage_quota_on_object_replacement`
- `20261011045528 seller_storage_files_and_upload_event_audit`
- `20261011045733 support_custom_storage_image_limits`
- `20261011045859 cap_configured_shared_image_size`
- `20261011045921 index_seller_storage_management_foreign_keys`
- `20261011045938 audit_storage_plan_configuration_changes`

## Verified project snapshot (2026-10-11)

- Supabase project: `ahncpjthmaxapawjzcwt`, status Active/Healthy, PostgreSQL 17, region `ap-northeast-1`.
- Existing `seller-media` bucket: public read, allowed types JPEG/PNG/WebP, technical object limit 10,000,000 bytes.
- Sellers: 1; storage assignments: 1.
- Actual objects in `seller-media`: 3 files totalling 126,996 bytes at verification time.
- Small/Medium/Large plan rows exist with the values listed above; the existing seller remains on the preserved Custom allowance.
- Storage INSERT and UPDATE policies call the server-side quota enforcement helpers; the new-seller assignment trigger exists.
- The seven privileged admin storage RPCs inspected were `SECURITY DEFINER`, denied to `anon`, and checked `public.admins` before privileged work.
- Vercel production deployment `dpl_J89Y8V8VbsJHCYajWt7GDjMT3MKX` was READY for commit `074b80eb43177e548e305bb0747640dd168fe88a`. The public homepage, JavaScript bundle, `robots.txt`, `sitemap.xml`, and `og-image.svg` returned HTTP 200 during smoke checks. Vercel's runtime-error aggregation reported no errors in the most recent hour checked.

## Important limits and caveats

The Supabase project metadata available to this integration does **not** disclose the account's subscription tier or live bandwidth/egress metrics. The admin panel therefore labels its platform allowance as **configured**, not as a provider-reported live quota. Verify the actual plan and egress in the Supabase dashboard. Do not interpret the warning setting as a guarantee against provider-side throttling, pauses or extra costs.

These checks do not replace authenticated browser end-to-end testing as a real seller and administrator. Upload-boundary tests, simultaneous direct Storage uploads, and admin plan changes still need real test sessions. Vercel Hobby runtime logs were not available for a 24-hour lookback, so the error check above is limited to the recent hour returned by the error aggregation API.
