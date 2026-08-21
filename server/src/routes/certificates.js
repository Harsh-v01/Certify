import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";

import {
  createCertificate,
  getCertificates,
  getCertificateById,
  updateCertificateStatus
} from "../models/Certificate.js";

import { createCertificatePdf } from "../services/certificateService.js";

const router = express.Router();

/* ---------------------------------------------------
   PATHS
--------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.resolve(
  __dirname,
  "../../generated"
);

/* ---------------------------------------------------
   FILE UPLOAD
--------------------------------------------------- */

const upload = multer({
  dest: path.join(os.tmpdir(), "certify-uploads"),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    const extensionOk =
      /\.(csv|xls|xlsx)$/i.test(
        file.originalname
      );

    cb(
      null,
      extensionOk ||
        allowed.includes(file.mimetype)
    );
  }
});

/* ---------------------------------------------------
   NORMALIZE CSV / EXCEL ROW
--------------------------------------------------- */

function normalizeRow(row) {
  const normalized = {};

  for (const [key, value] of Object.entries(row)) {
    normalized[
      String(key).trim().toLowerCase()
    ] = value;
  }

  return {
    name: String(
      normalized.name ??
      normalized["recipient name"] ??
      ""
    ).trim(),

    email: String(
      normalized.email ?? ""
    ).trim(),

    event: String(
      normalized.event ??
      normalized["event name"] ??
      ""
    ).trim(),

    /*
     * IMPORTANT:
     * Do NOT convert date to String here.
     *
     * Excel may give us a number such as:
     * 46254.22928240741
     */
    date:
      normalized.date ??
      normalized["issue date"] ??
      ""
  };
}

/* ---------------------------------------------------
   CERTIFICATE ID
--------------------------------------------------- */

function makeId(index) {
  const year = new Date().getFullYear();

  const random = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `CERT-${year}-${random}-${String(index).padStart(
    3,
    "0"
  )}`;
}

/* ---------------------------------------------------
   CLEAN TEMP FILE
--------------------------------------------------- */

function cleanup(filePath) {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup errors
  }
}

/* ---------------------------------------------------
   NORMALIZE DATE
--------------------------------------------------- */

function normalizeIssueDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text = String(value).trim();

  /*
   * Excel serial date
   *
   * Example:
   * 46254.22928240741
   *
   * Excel uses 1899-12-30 as its
   * date system base.
   */
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);

    if (!Number.isFinite(serial)) {
      return null;
    }

    const excelEpoch = Date.UTC(
      1899,
      11,
      30
    );

    const milliseconds =
      serial *
      24 *
      60 *
      60 *
      1000;

    const date = new Date(
      excelEpoch + milliseconds
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return [
      date.getUTCFullYear(),

      String(
        date.getUTCMonth() + 1
      ).padStart(2, "0"),

      String(
        date.getUTCDate()
      ).padStart(2, "0")
    ].join("-");
  }

  /*
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    return text;
  }

  /*
   * DD/MM/YYYY
   */
  let match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (match) {
    const [, day, month, year] =
      match;

    return `${year}-${String(
      month
    ).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  /*
   * DD-MM-YYYY
   */
  match = text.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  );

  if (match) {
    const [, day, month, year] =
      match;

    return `${year}-${String(
      month
    ).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  /*
   * DD-MMM-YY
   *
   * Example:
   * 20-Aug-26
   */
  match = text.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/
  );

  if (match) {
    const [
      ,
      day,
      monthText,
      yearText
    ] = match;

    const months = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12
    };

    const month =
      months[
        monthText.toLowerCase()
      ];

    if (!month) {
      return null;
    }

    const year =
      2000 +
      Number(yearText);

    return `${year}-${String(
      month
    ).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  /*
   * "20 August 2026"
   */
  const parsed =
    new Date(text);

  if (
    !Number.isNaN(
      parsed.getTime()
    )
  ) {
    return [
      parsed.getFullYear(),

      String(
        parsed.getMonth() + 1
      ).padStart(
        2,
        "0"
      ),

      String(
        parsed.getDate()
      ).padStart(
        2,
        "0"
      )
    ].join("-");
  }

  return null;
}

/* ===================================================
   PREVIEW
=================================================== */

router.post(
  "/preview",
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload an Excel or CSV file."
        });
      }

      const fileBuffer =
        fs.readFileSync(
          req.file.path
        );

      const workbook =
        XLSX.read(
          fileBuffer,
          {
            type: "buffer"
          }
        );

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: ""
          }
        );

      cleanup(req.file.path);

      const records =
        rows.map(normalizeRow);

      const valid =
        records.filter(
          (row) =>
            row.name &&
            row.event &&
            row.date
        );

      return res.json({
        total:
          records.length,

        valid:
          valid.length,

        invalid:
          records.length -
          valid.length,

        records
      });

    } catch (error) {
      cleanup(
        req.file?.path
      );

      console.error(
        "FILE PREVIEW ERROR:",
        error
      );

      return res.status(400).json({
        message:
          "Could not read the uploaded file.",

        error:
          error.message
      });
    }
  }
);

/* ===================================================
   GENERATE CERTIFICATES
=================================================== */

router.post(
  "/generate",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload an Excel or CSV file."
        });
      }

      const fileBuffer =
        fs.readFileSync(
          req.file.path
        );

      const workbook =
        XLSX.read(
          fileBuffer,
          {
            type: "buffer"
          }
        );

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: ""
          }
        );

      cleanup(req.file.path);

      const records =
        rows.map(normalizeRow);

      const valid =
        records.filter(
          (row) =>
            row.name &&
            row.event &&
            row.date
        );

      if (!valid.length) {
        return res.status(400).json({
          message:
            "No valid participant rows found. Required columns: Name, Event, Date."
        });
      }

      const created = [];

      for (
        let i = 0;
        i < valid.length;
        i += 1
      ) {
        const row =
          valid[i];

        const certificateId =
          makeId(i + 1);

        /*
         * Convert Excel/CSV date
         * into MySQL DATE format.
         */
        const issueDate =
          normalizeIssueDate(
            row.date
          );

        if (!issueDate) {
          throw new Error(
            `Invalid date for ${row.name}: ${row.date}`
          );
        }

        console.log(
          `Generating ${certificateId} for ${row.name} - ${issueDate}`
        );

        /*
         * Generate PDF + QR
         */
        const pdf =
          await createCertificatePdf({
            certificateId,

            recipientName:
              row.name,

            eventName:
              row.event,

            issueDate
          });

        /*
         * Store certificate in MySQL
         */
        const certificate =
          await createCertificate({
            certificateId,

            recipientName:
              row.name,

            email:
              row.email,

            eventName:
              row.event,

            issueDate,

            status:
              "VALID",

            pdfPath:
              pdf.filename
          });

        created.push(
          certificate
        );
      }

      return res.status(201).json({
        message:
          `${created.length} certificate(s) generated successfully.`,

        certificates:
          created
      });

    } catch (error) {
      cleanup(
        req.file?.path
      );

      console.error(
        "CERTIFICATE GENERATION ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        message:
          "Certificate generation failed.",

        error:
          error.message
      });
    }
  }
);

/* ===================================================
   GET CERTIFICATES
=================================================== */

router.get(
  "/",
  async (req, res) => {
    try {
      const search =
        String(
          req.query.search ||
          ""
        ).trim();

      const certificates =
        await getCertificates(
          search
        );

      res.json(
        certificates
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Could not load certificates."
      });
    }
  }
);

/* ===================================================
   DOWNLOAD ALL
=================================================== */

router.get(
  "/download-all",
  async (_req, res) => {
    try {
      const certificates =
        await getCertificates();

      res.setHeader(
        "Content-Type",
        "application/zip"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="certify-certificates.zip"'
      );

      const archive =
        archiver(
          "zip",
          {
            zlib: {
              level: 9
            }
          }
        );

      archive.on(
        "error",
        (error) =>
          res.destroy(
            error
          )
      );

      archive.pipe(res);

      for (
        const certificate
        of certificates
      ) {
        const filePath =
          path.join(
            generatedDir,
            certificate.pdfPath
          );

        if (
          fs.existsSync(
            filePath
          )
        ) {
          archive.file(
            filePath,
            {
              name:
                certificate.pdfPath
            }
          );
        }
      }

      await archive.finalize();

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Could not create ZIP file."
      });
    }
  }
);

/* ===================================================
   DOWNLOAD SINGLE CERTIFICATE
=================================================== */

router.get(
  "/:certificateId/download",
  async (req, res) => {
    try {
      const certificate =
        await getCertificateById(
          req.params.certificateId
        );

      if (!certificate) {
        return res.status(404).json({
          message:
            "Certificate not found."
        });
      }

      const filePath =
        path.join(
          generatedDir,
          certificate.pdfPath
        );

      console.log(
        "Downloading PDF:",
        filePath
      );

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res.status(404).json({
          message:
            "PDF file not found."
        });
      }

      res.download(
        filePath,
        certificate.pdfPath
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Could not download certificate."
      });
    }
  }
);

/* ===================================================
   REVOKE CERTIFICATE
=================================================== */

router.patch(
  "/:certificateId/revoke",
  async (req, res) => {
    try {
      const certificate =
        await updateCertificateStatus(
          req.params.certificateId,
          "REVOKED"
        );

      if (!certificate) {
        return res.status(404).json({
          message:
            "Certificate not found."
        });
      }

      res.json(
        certificate
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Could not revoke certificate."
      });
    }
  }
);

export default router;