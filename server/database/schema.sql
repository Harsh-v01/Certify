CREATE DATABASE IF NOT EXISTS certify;
USE certify;

CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(100) NOT NULL UNIQUE,
  recipient_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  event_name VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  status ENUM('VALID', 'REVOKED') NOT NULL DEFAULT 'VALID',
  pdf_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_recipient_name ON certificates(recipient_name);
CREATE INDEX idx_status ON certificates(status);
