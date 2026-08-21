import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { api, API_URL } from "./api";
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Upload,
  XCircle
} from "lucide-react";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark"><ShieldCheck size={17} /></span>
          Certify
        </Link>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/certificates">Certificates</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

function Dashboard() {
  const [certificates, setCertificates] = useState([]);
  useEffect(() => {
    api.get("/certificates").then(r => setCertificates(r.data)).catch(() => {});
  }, []);

  const valid = certificates.filter(c => c.status === "VALID").length;
  const revoked = certificates.filter(c => c.status === "REVOKED").length;

  return (
    <Layout>
      <section className="hero">
        <div>
          <div className="eyebrow">CERTIFICATE OPERATIONS</div>
          <h1>Generate. Verify. Trust.</h1>
          <p>Generate certificates in bulk and give every certificate a simple QR-based verification page.</p>
          <div className="actions">
            <Link className="btn primary" to="/generate"><Upload size={16}/> Generate certificates</Link>
            <Link className="btn secondary" to="/certificates">View certificates</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top"><span className="online-dot"/> System ready</div>
          <div className="hero-card-id">CERT-2026-A8F92K</div>
          <div className="hero-card-status"><CheckCircle2 size={17}/> Certificate verification enabled</div>
        </div>
      </section>

      <section className="stats">
        <Stat icon={<FileText size={18}/>} label="Certificates" value={certificates.length} />
        <Stat icon={<CheckCircle2 size={18}/>} label="Valid" value={valid} />
        <Stat icon={<XCircle size={18}/>} label="Revoked" value={revoked} />
      </section>

      <section className="info-grid">
        <div className="panel">
          <div className="panel-title"><LayoutDashboard size={17}/> Simple workflow</div>
          <div className="steps">
            <Step n="01" title="Upload" text="Import Excel or CSV participant data." />
            <Step n="02" title="Generate" text="Create PDFs with unique IDs and QR codes." />
            <Step n="03" title="Verify" text="Scan a QR code to check certificate status." />
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><Award size={17}/> What it supports</div>
          <ul className="clean-list">
            <li>Bulk PDF generation</li>
            <li>Public certificate verification</li>
            <li>Search and download</li>
            <li>Certificate revocation</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}

function Stat({ icon, label, value }) {
  return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}

function Step({ n, title, text }) {
  return <div className="step"><span>{n}</span><div><b>{title}</b><p>{text}</p></div></div>;
}

function Generate() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePreview() {
    if (!file) return setError("Choose an Excel or CSV file first.");
    setError(""); setMessage(""); setPreview(null);
    const form = new FormData(); form.append("file", file);
    try {
      const { data } = await api.post("/certificates/preview", form);
      setPreview(data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not preview file.");
    }
  }

  async function handleGenerate() {
    if (!file) return;
    setBusy(true); setError(""); setMessage("");
    const form = new FormData(); form.append("file", file);
    try {
      const { data } = await api.post("/certificates/generate", form);
      setMessage(data.message);
      setPreview(null);
      setFile(null);
    } catch (e) {
      setError(
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Generation failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div><div className="eyebrow">CERTIFICATE GENERATION</div><h2>Generate certificates</h2><p>Upload participant data and create certificates in bulk.</p></div>
      </div>

      <div className="panel upload-panel">
        <div className="upload-box">
          <FileSpreadsheet size={30}/>
          <h3>Upload participant data</h3>
          <p>Excel or CSV · Required: Name, Email, Event, Date</p>
          <label className="file-btn">
            Choose file
            <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          {file && <div className="selected-file"><FileText size={15}/> {file.name}</div>}
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={handlePreview} disabled={!file}>Preview data</button>
          <button className="btn primary" onClick={handleGenerate} disabled={!file || busy}>{busy ? "Generating..." : "Generate certificates"}</button>
        </div>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
      </div>

      {preview && (
        <div className="panel">
          <div className="panel-title">Import preview</div>
          <div className="preview-meta">
            <span>Total: <b>{preview.total}</b></span>
            <span>Valid: <b>{preview.valid}</b></span>
            <span>Invalid: <b>{preview.invalid}</b></span>
          </div>
          <div className="table-wrap">
            <table><thead><tr><th>Name</th><th>Email</th><th>Event</th><th>Date</th></tr></thead>
            <tbody>{preview.records.slice(0, 50).map((r, i) => <tr key={i}><td>{r.name || "—"}</td><td>{r.email || "—"}</td><td>{r.event || "—"}</td><td>{r.date || "—"}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Certificates() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await api.get("/certificates", { params: { search } });
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function revoke(id) {
    await api.patch(`/certificates/${id}/revoke`);
    load();
  }

  return (
    <Layout>
      <div className="page-head">
        <div><div className="eyebrow">CERTIFICATE MANAGEMENT</div><h2>Certificates</h2><p>Search, download and manage generated certificates.</p></div>
        <a className="btn secondary" href={`${API_URL}/certificates/download-all`}>Download ZIP</a>
      </div>

      <div className="panel">
        <div className="search-row">
          <Search size={17}/>
          <input placeholder="Search by name or certificate ID" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} />
          <button className="btn secondary" onClick={load}>Search</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Certificate ID</th><th>Recipient</th><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.certificateId}>
                  <td className="mono">{c.certificateId}</td>
                  <td>{c.recipientName}</td>
                  <td>{c.eventName}</td>
                  <td>{c.issueDate}</td>
                  <td><span className={`badge ${c.status === "VALID" ? "valid" : "revoked"}`}>{c.status}</span></td>
                  <td className="actions-cell">
                    <a className="small-btn" href={`${API_URL}/certificates/${c.certificateId}/download`}>Download</a>
                    {c.status === "VALID" && <button className="small-btn danger" onClick={() => revoke(c.certificateId)}>Revoke</button>}
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan="6" className="empty">No certificates found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function Verify() {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/verify/${certificateId}`)
      .then(r => setResult(r.data))
      .catch(() => setError(true));
  }, [certificateId]);

  if (error) return <VerifyResult found={false} />;
  if (!result) return <div className="verify-shell"><div className="verify-card">Checking certificate...</div></div>;
  return <VerifyResult result={result} found />;
}

function VerifyResult({ result, found }) {
  if (!found) return (
    <div className="verify-shell">
      <div className="verify-card invalid"><XCircle size={42}/><div className="eyebrow">VERIFICATION RESULT</div><h1>Certificate Not Found</h1><p>No certificate with this ID exists in Certify.</p><Link className="btn secondary" to="/">Back to Certify</Link></div>
    </div>
  );

  const c = result.certificate;
  const valid = result.status === "VALID";
  return (
    <div className="verify-shell">
      <div className={`verify-card ${valid ? "" : "invalid"}`}>
        {valid ? <CheckCircle2 size={44}/> : <XCircle size={44}/>}
        <div className="eyebrow">PUBLIC VERIFICATION</div>
        <h1>{valid ? "Certificate Valid" : "Certificate Revoked"}</h1>
        <p className="verify-recipient">{c.recipientName}</p>
        <div className="verify-details">
          <div><span>Event</span><b>{c.eventName}</b></div>
          <div><span>Issue date</span><b>{c.issueDate}</b></div>
          <div><span>Certificate ID</span><b className="mono">{c.certificateId}</b></div>
          <div><span>Status</span><b>{c.status}</b></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/generate" element={<Generate />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/verify/:certificateId" element={<Verify />} />
    </Routes>
  );
}
