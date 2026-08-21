import express from "express";
import { getCertificateById } from "../models/Certificate.js";

const router = express.Router();

router.get("/:certificateId", async (req, res) => {
  try {
    const certificate = await getCertificateById(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        status: "NOT_FOUND",
        message: "Certificate Not Found"
      });
    }

    res.json({
      valid: certificate.status === "VALID",
      status: certificate.status,
      message: certificate.status === "VALID" ? "Certificate Valid" : "Certificate Revoked",
      certificate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed." });
  }
});

export default router;
