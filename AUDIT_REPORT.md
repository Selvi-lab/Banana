# BANAFIBRE project audit and repair notes

## Scope inspected

Reviewed the uploaded Next.js 15 / React 19 project, customer-facing pages, cart context, product/category data, MySQL connection helper, order APIs, login/register pages, delivery location panel, admin APIs and admin pages.

## Critical issues found and repaired in this working copy

1. **Cart state was split across multiple implementations.** Product details wrote only `{ id, quantity }` directly to localStorage, the cart page read localStorage independently, and checkout read React context. This caused missing product prices and an empty/stale checkout cart. The project now uses one `banafibre-cart` key and one `CartContext`; product detail, cart, checkout and cart count use the same state. Legacy ID-only cart entries are enriched from the local catalogue where possible.
2. **Delivery price mismatch.** Cart used ₹50, checkout/API used ₹60. The shared rule is now ₹60 below ₹999 and free at ₹999 or above.
3. **Order API response handling.** Checkout reads response text safely before JSON parsing and displays server errors instead of throwing `Unexpected end of JSON input`.
4. **Order creation validation.** Server recalculates prices from MySQL and checks product stock; it does not trust prices sent by the browser. It records order items and an initial `confirmed` tracking event in a transaction.
5. **Order detail route was missing.** The API detail route was empty, and the success page linked to `/orders/[id]` while the only page was `/order/[id]`. A plural route now exists; the old singular route redirects to it.
6. **Order privacy.** Guest order details require the order ID plus the mobile number used at checkout. Signed-in customers can view orders that match their account email. Full delivery details are no longer exposed by guessing a numeric order ID.
7. **Order history.** `/orders` now loads orders for the signed-in account email.
8. **Login and registration were demo alerts.** Added customer registration/login endpoints, scrypt password hashing, signed HTTP-only session cookies, account session lookup and logout.
9. **Admin protection.** Admin pages and the dashboard/products/orders/customers/coupon/gift/notification/reward APIs now require an account with the `admin` role. Customer registration cannot self-assign admin.
10. **Product catalogue integration.** Added public MySQL read APIs for products and categories. Shop, category and product detail pages load database records and fall back to the local preview catalogue if the database is unavailable.
11. **Location persistence.** Homepage delivery PIN is saved in localStorage and prefilled in checkout. The browser location button asks for geolocation permission but still requires a PIN to confirm delivery.
12. **Navigation and assets.** Added shared header/footer to non-home, non-auth and non-admin pages; fixed the cart count, wishlist storage-key mismatch, missing placeholder image and missing artisan image reference.
13. **Admin basics.** Added database-backed order status management, product creation/visibility, customer list and coupon creation pages.

## Required setup before testing

1. Back up your existing `banafibre` database.
2. In MySQL Workbench, inspect your current schema:
   ```sql
   USE banafibre;
   SHOW TABLES;
   DESCRIBE products;
   DESCRIBE categories;
   DESCRIBE orders;
   DESCRIBE order_items;
   DESCRIBE order_tracking;
   ```
3. `database/banafibre_setup.sql` is a baseline schema + seed file for a new database. It uses `CREATE TABLE IF NOT EXISTS`; it **does not alter existing tables**. Do not blindly run it against an existing schema without comparing the columns above. The order API requires the columns defined in that file.
4. Copy `.env.example` to `.env.local` and enter your own MySQL credentials. Generate `AUTH_SECRET` with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Do not commit `.env.local`.
5. Install dependencies in the project folder (`npm ci`) and start with `npm run dev`.
6. Create the first account using `/register`. Then in Workbench promote only your own account:
   ```sql
   USE banafibre;
   UPDATE customer_accounts
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```
   Sign out and sign in again before opening `/admin`.

## Important product/business limitations still not integrated

- Payment is **Cash on Delivery only**. No Razorpay/Stripe/UPI payment verification is included.
- The delivery PIN is saved locally, but there is no courier serviceability API or postal address auto-completion.
- Browser geolocation does not reverse-geocode coordinates into a PIN; the customer must enter the PIN.
- Delivery estimates are a provisional 7-calendar-day estimate, not a courier-confirmed promise.
- Courier tracking is manual status updates by an admin; no Shiprocket/Delhivery/India Post carrier API or live tracking number integration exists.
- Coupon creation/management is present, but coupon application and discount recalculation in checkout/order creation are not yet connected.
- Returns, refunds, customer cancellation UI, password reset, email/SMS notifications and automatic reward crediting are not complete.
- Address book / multiple saved addresses is not connected to a customer profile yet.
- Admin reports and settings pages remain placeholders.
- Login/register currently have no rate limiting, email verification, password reset, or dedicated security monitoring. Add these before public production launch.

## Verification performed here

- JavaScript/JSX files were parsed with the globally available TypeScript parser: no syntax diagnostics were reported.
- API/library JavaScript files passed `node --check`.
- A full Next.js production build could not be completed in this environment: dependency installation timed out and the local `next` executable was unavailable in the partially installed `node_modules`.
- No live MySQL server or project `.env.local` credentials were included in the ZIP, so database queries, account creation and real checkout were not executed here.
