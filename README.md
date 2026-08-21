# Certify

### Full Stack Certificate Generation & Verification Platform

Certify is a full-stack web application that simplifies certificate creation and verification for workshops, events, training programs, and college organizations.

It allows an administrator to upload participant data, generate personalized PDF certificates in bulk, and attach a unique QR code to every certificate. Anyone can scan the QR code to verify the certificate's authenticity and current status.

## What I Built

- Built a React-based certificate management dashboard
- Developed REST APIs using Node.js and Express
- Integrated MySQL for persistent certificate records
- Implemented CSV/Excel participant data processing
- Built automated PDF certificate generation
- Added unique certificate IDs and QR-based verification
- Implemented certificate search and management
- Added certificate revocation with real-time verification status
- Implemented individual PDF and bulk ZIP downloads
- Designed a public certificate verification workflow

## Key Workflow

Participant CSV/Excel  
→ Data Processing  
→ Certificate ID Generation  
→ PDF + QR Generation  
→ MySQL Storage  
→ Public QR Verification

## Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**Libraries:** PDFKit, QRCode, XLSX, Multer, Archiver

## Key Features

### Bulk Certificate Generation
Upload participant information through CSV or Excel and generate personalized certificates without creating them manually.

### QR-Based Verification
Every certificate contains a unique QR code linked to its verification page.

### Certificate Management
Search generated certificates by name or certificate ID, download certificates, and manage their status.

### Certificate Revocation
Certificates can be marked as `VALID` or `REVOKED`. The verification page reflects the current status.

### Public Verification
Anyone with a certificate can scan its QR code and verify:

- Recipient
- Event
- Issue Date
- Certificate ID
- Current Status

## Engineering Highlights

- RESTful API architecture
- Relational database design using MySQL
- File upload and spreadsheet parsing
- Automated document generation
- QR code generation and verification
- Server-side validation and error handling
- Separation of frontend, backend, database, and document-generation logic

## Project Structure

```text
Certify/
├── client/          # React frontend
├── server/          # Express backend
├── sample-data/     # Sample CSV data
├── showcase/        # Project showcase website
└── package.json
```
## Why This Project?

Certify was built as a practical Full Stack Development project to solve a common problem faced by colleges, workshops, clubs, and training programs: generating large numbers of certificates while providing a simple way to verify them.
The project focuses on implementing a complete end-to-end workflow rather than adding unnecessary technologies or features.
