# BANAFIBRE repairs

See `AUDIT_REPORT.md` for the full audit, setup instructions, known limitations and verification notes.

The most important repair is that the storefront now uses one shared cart state across product details, cart, checkout and cart count. MySQL remains the source of truth for product prices and stock when an order is placed.

Before using the project with an existing database, compare your live schema with `database/banafibre_setup.sql`. Do not overwrite or blindly recreate existing tables.
