# Certify local setup

1. Start MySQL and make sure the `certify` database and `certificates` table exist.
2. Copy `server/.env.example` to `server/.env` and set DB_PASSWORD if needed.
3. From the project root run `npm run install-all`.
4. Run `npm run dev`.
5. Open http://localhost:5173.

No MongoDB is required.
