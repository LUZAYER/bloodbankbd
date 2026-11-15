# Archived Legacy Prototype (BloodLink PHP)

> **Status**: Archived / Reference Only

This directory contains the original PHP database setup, schema definitions, and migration scripts from the early prototype phase of the platform.

### Directory Contents:
- `config/`: Original PDO database connection (`db.php`).
- `database/`:
  - `schema.sql`: Initial SQL schema definitions for MySQL and SQLite.
  - `seed_data.sql`: Base location and user seed queries.
  - `setup.php`: Automated browser/CLI migration setup runner.
  - `bloodlink.sqlite`: Initial prototype database file.
- `includes/`:
  - `compatibility.php`: Historical procedural blood compatibility checks.
  - `distance.php`: Procedural distance calculation routines.
  - `ml_client.php`: Procedural bridge between PHP and Python ML microservice.
- `css/`: Prototype CSS stylesheet (`style.css`).

> **Note**: The modern enterprise production system runs on **Next.js 14 App Router, TypeScript, Prisma ORM, and Tailwind CSS** located in `/src` and `/prisma`.
