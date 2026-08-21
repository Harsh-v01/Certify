import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.resolve(__dirname, "../../generated");

export async function createCertificatePdf({
  certificateId,
  recipientName,
  eventName,
  issueDate
}) {
  fs.mkdirSync(generatedDir, { recursive: true });

  const filename = `${certificateId}.pdf`;
  const filePath = path.join(generatedDir, filename);
  const verificationUrl =
    `${process.env.PUBLIC_BASE_URL || "http://localhost:5173"}/verify/${certificateId}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 180,
    margin: 1,
    errorCorrectionLevel: "H"
  });

  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0
    });

    const stream = fs.createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);

    doc.pipe(stream);

    const width = doc.page.width;
    const height = doc.page.height;

    doc.rect(0, 0, width, height).fill("#f4f1e7");
    doc.rect(22, 22, width - 44, height - 44)
      .lineWidth(2)
      .stroke("#2d8b55");
    doc.rect(32, 32, width - 64, height - 64)
      .lineWidth(0.7)
      .stroke("#b9a66d");

    doc.fillColor("#1f2822")
      .font("Times-Bold")
      .fontSize(28)
      .text("CERTIFICATE OF COMPLETION", 0, 105, {
        align: "center",
        width
      });

    doc.fillColor("#59615b")
      .font("Helvetica")
      .fontSize(12)
      .text("This certificate is proudly presented to", 0, 160, {
        align: "center",
        width
      });

    doc.fillColor("#25814c")
      .font("Times-Italic")
      .fontSize(34)
      .text(recipientName, 0, 185, {
        align: "center",
        width
      });

    doc.fillColor("#59615b")
      .font("Helvetica")
      .fontSize(12)
      .text("for successfully completing", 0, 238, {
        align: "center",
        width
      });

    doc.fillColor("#202720")
      .font("Helvetica-Bold")
      .fontSize(17)
      .text(eventName, 0, 265, {
        align: "center",
        width
      });

    doc.fillColor("#555e58")
      .font("Helvetica")
      .fontSize(10)
      .text(`Issued: ${issueDate}`, 85, height - 90);

    doc.text(`Certificate ID: ${certificateId}`, 85, height - 70);

    doc.image(qrBuffer, width - 145, height - 145, {
      width: 85,
      height: 85
    });

    doc.fillColor("#68706b")
      .fontSize(8)
      .text("Scan to verify", width - 145, height - 52, {
        width: 85,
        align: "center"
      });

    doc.end();
  });

  return { filename, filePath, verificationUrl };
}
