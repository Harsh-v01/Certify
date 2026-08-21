import { db } from "../db.js";

export async function createCertificate(data) {
  console.log("INSERTING CERTIFICATE:", data.certificateId);

  await db.execute(
    `INSERT INTO certificates
      (certificate_id, recipient_name, email, event_name, issue_date, status, pdf_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.certificateId,
      data.recipientName,
      data.email || null,
      data.eventName,
      data.issueDate,
      data.status || "VALID",
      data.pdfPath || null
    ]
  );

  console.log("INSERT SUCCESS:", data.certificateId);

  const certificate = await getCertificateById(data.certificateId);

  console.log("DB LOOKUP AFTER INSERT:", certificate);

  return certificate;
}

export async function getCertificates(search = "") {
  let sql = `
    SELECT id,
           certificate_id AS certificateId,
           recipient_name AS recipientName,
           email,
           event_name AS eventName,
           issue_date AS issueDate,
           status,
           pdf_path AS pdfPath,
           created_at AS createdAt
    FROM certificates
  `;
  const params = [];

  if (search) {
    sql += ` WHERE certificate_id LIKE ? OR recipient_name LIKE ? `;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY created_at DESC`;

  const [rows] = await db.execute(sql, params);
  return rows;
}

export async function getCertificateById(certificateId) {
  const [rows] = await db.execute(
    `SELECT id,
            certificate_id AS certificateId,
            recipient_name AS recipientName,
            email,
            event_name AS eventName,
            issue_date AS issueDate,
            status,
            pdf_path AS pdfPath,
            created_at AS createdAt
     FROM certificates
     WHERE certificate_id = ?
     LIMIT 1`,
    [certificateId]
  );

  return rows[0] || null;
}

export async function updateCertificateStatus(certificateId, status) {
  await db.execute(
    `UPDATE certificates SET status = ? WHERE certificate_id = ?`,
    [status, certificateId]
  );

  return getCertificateById(certificateId);
}
