import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";
import certificatesRouter from "./routes/certificates.js";
import verificationRouter from "./routes/verification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "certify-api" });
});

app.use("/api/certificates", certificatesRouter);
app.use("/api/verify", verificationRouter);
app.use("/generated", express.static(path.resolve(__dirname, "../generated")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Certify API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
