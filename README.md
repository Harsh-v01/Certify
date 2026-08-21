# Certify

A simple full-stack web application for generating, managing, and verifying digital certificates.

## Tech Stack

- React + Vite + CSS
- Node.js + Express
- MySQL + mysql2
- PDFKit
- QRCode
- XLSX
- Multer
- Archiver

## Features

- Upload CSV/Excel participant data
- Preview participant records
- Bulk certificate generation
- Unique certificate IDs
- PDF certificates with QR codes
- MySQL certificate database
- Public QR verification
- Search certificates by name or ID
- Revoke certificates
- Download individual PDFs
- Download all certificates as a ZIP

## How It Works

CSV / Excel  
↓  
React Frontend  
↓  
Express API  
↓  
Generate PDF + QR Code  
↓  
MySQL Database  
↓  
Public Verification


## Run Locally

### Requirements

- Node.js 18+
- MySQL Server

### Install

    npm install
    npm run install-all

### Environment

Create `server/.env` and add:

    PORT=5000

    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=certify

    PUBLIC_BASE_URL=http://localhost:5173

### MySQL Setup

Create the database:

    CREATE DATABASE certify;

Then run the database schema located at:

    server/database/schema.sql

### Start the Application

    npm run dev

Frontend:

    http://localhost:5173

Backend:

    http://localhost:5000

## CSV Format

Use these columns:

    Name | Email | Event | Date

Example:

    Harsh Kumar | harsh@example.com | Python Workshop | 2026-08-20
    Rahul Sharma | rahul@example.com | Python Workshop | 2026-08-20
    Priya Shah | priya@example.com | Web Development | 2026-08-21

A sample file is available in `sample-data/participants.csv`.

## QR Verification

Each certificate receives a unique ID such as:

    CERT-2026-AB12X-001

The QR code points to:

    PUBLIC_BASE_URL/verify/CERTIFICATE_ID

The verification page displays:

- ✓ Certificate Valid
- ⚠ Certificate Revoked
- ✕ Certificate Not Found

## Showcase

The `showcase/` directory contains the public landing page for the Certify project.

The showcase is deployed separately using GitHub Pages.

## Project Philosophy

Certify is intentionally kept simple and practical.

The project does not use AI, blockchain, microservices, Redis, Docker, analytics, or unnecessary authentication.

The goal is to demonstrate a practical Full Stack Development workflow involving:

- React frontend
- Express backend
- MySQL database
- CSV/Excel processing
- PDF generation
- QR-based certificate verification

## Status

In Development
