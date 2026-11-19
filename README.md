# BANAFIBRE

Next.js 15 + React 19 storefront with MySQL 8.0.

## Local setup

1. Install Node.js 20+.
2. Back up your existing MySQL `banafibre` database.
3. Compare your existing schema with `database/banafibre_setup.sql`. The setup file is a baseline for new databases and does not alter existing tables.
4. Copy `.env.example` to `.env.local` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a random `AUTH_SECRET` (at least 32 characters).
5. Install and run:
   ```bash
   npm ci
   npm run dev
   ```
6. Open `http://localhost:3000`.

## Customer accounts and admin

Create a customer account at `/register`. To make your own account an administrator, update its role in MySQL Workbench:

```sql
USE banafibre;
UPDATE customer_accounts
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

Sign out and back in, then open `/admin`.

## Database setup

See `database/banafibre_setup.sql`. If you already have `products`, `categories`, or `orders` tables, inspect them with `DESCRIBE` before running the setup SQL. The application expects the columns defined in the setup file.

## Notes

- COD is the only implemented payment method.
- Courier updates are manual admin updates, not a live carrier integration.
- Review `AUDIT_REPORT.md` for repaired issues, setup requirements, and remaining production work.
