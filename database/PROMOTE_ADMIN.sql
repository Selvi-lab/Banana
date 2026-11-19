-- First create an account through /register, then replace the email below.
USE banafibre;
UPDATE customer_accounts
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
-- Sign out and sign back in so the new role is loaded into your session.
