# Certify

A simple full-stack certificate generation and verification web app.

## Stack

- React + Vite + CSS
- Node.js + Express
- MySQL + mysql2
- PDFKit for PDF certificates
- qrcode for QR codes
- xlsx for Excel/CSV imports

## Features

- Upload Excel/CSV participant data
- Preview participant records
- Bulk certificate generation
- Unique certificate IDs
- PDF certificates with QR codes
- MySQL certificate records
- Public QR verification
- Search certificates
- Revoke certificates
- Download individual PDFs
- Download a ZIP of generated PDFs

## Run locally

Requirements:
- Node.js 18+
- MySQL running locally or a MySQL connection string

Install:

```bash
npm install
npm run install-all
```

Copy environment files:

```bash
copy server\.env.example server\.env
```

Linux/macOS:

```bash
cp server/.env.example server/.env
```

Start:

```bash
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

## MySQL

Default local database:

`mongodb://127.0.0.1:27017/certify`

Change `MONGODB_URI` in `server/.env` if needed.

## Excel format

Use these columns:

```text
Name | Email | Event | Date
Harsh Kumar | harsh@example.com | Python Workshop | 2026-08-20
```

A sample file is included in `sample-data/participants.csv`.

## QR verification

The QR code points to:

`PUBLIC_BASE_URL/verify/CERTIFICATE_ID`

For local development, the default is:

`http://localhost:5173`

For deployment, change `PUBLIC_BASE_URL` to the deployed frontend URL.

## Project structure

```text
Certify/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
└── sample-data/
```

This version intentionally avoids authentication, AI, microservices, analytics, Redis, Docker and other unnecessary complexity.


## MySQL setup

1. Install MySQL Server locally.
2. Start the MySQL service.
3. Create the database/tables by running `server/database/schema.sql`.
4. Copy `server/.env.example` to `server/.env` and set your MySQL password.
5. Install dependencies with `npm install` in the root/server as required.
