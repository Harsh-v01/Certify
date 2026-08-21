# Certify Architecture

```text
React + CSS
    |
    v
Express REST API
    |
    v
MySQL / mysql2
    |
    +--> XLSX parser
    +--> PDFKit
    +--> QRCode
```

Generation:

```text
Excel/CSV
  -> validation + preview
  -> Express
  -> PDF + QR
  -> MySQL certificate record
```

Verification:

```text
QR
 -> /verify/:certificateId
 -> React verification page
 -> Express /api/verify/:certificateId
 -> MySQL
 -> VALID / REVOKED / NOT_FOUND
```

The QR contains a public URL, while certificate truth is stored in MySQL.
