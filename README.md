# SecuraX: AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework

> **Smart India Hackathon (SIH)** Solution: Deep Packet Inspection, Cryptographic Auditing, Anomaly Detection, and AI-Driven Hardening for IPsec VPNs.

---

## 🌟 Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│           Vite + React + Tailwind Frontend            │
│   (Upload, Traffic Analysis, Security Audit, Reports,  │
│       History, Static Config Auditor, AI Assistant)    │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JSON / FormData)
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Backend Application               │
│                   (backend/app.py)                     │
├────────────────────────────────────────────────────────┤
│  1. PCAP / PCAPNG Deep Dissector                       │
│     - IKEv1 (Main & Aggressive Mode, Phase 1 & 2)      │
│     - IKEv2 (IKE_SA_INIT, IKE_AUTH, CREATE_CHILD_SA)   │
│     - ESP & AH Headers, SPIs, Anti-Replay Windows      │
│     - Shannon Entropy Analysis (Plaintext Leakage)     │
│                                                        │
│  2. Cryptographic & Security Rule Engine               │
│     - NIST SP 800-77 Rev 1 (IPsec Guide) Benchmark     │
│     - RFC 8221 (ESP/AH Cryptographic Requirements)     │
│     - RFC 8247 (IKEv2 Algorithm Requirements)          │
│     - CIS IPsec Benchmark v1.2                         │
│     - Sweet32 (CVE-2016-2183), Logjam, Hash Leak Audits│
│                                                        │
│  3. AI-Powered Insights & Remediation Engine           │
│     - Executive Narrative & Risk Radar Breakdown       │
│     - Prioritized Remediation Action Plan              │
│     - Auto-Generated Hardened Configurations           │
│       (strongSwan, Cisco IOS-XE, Fortinet FortiGate)   │
│     - Interactive AI Security Advisor (Q&A Assistant)  │
│                                                        │
│  4. Static Configuration Auditor                       │
│     - Direct auditing of raw Cisco, strongSwan configs │
└────────────────────────────────────────────────────────┘
```

---

### 🚀 Unified Run (Single Link - Frontend + Backend merged)

Run everything on a single port (**`http://localhost:8000`**) with one command:

```bash
# On Windows, simply double-click or run:
start.bat

# Or run manually:
cd vite-project && npm run build && cd ../backend && python app.py
```

* **Complete Web Application (Dashboard + API)**: [http://localhost:8000](http://localhost:8000)
* **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 💻 Developer Mode (Hot-Reloading)

If developing and needing live reload for both:
1. **Backend**: `cd backend && python app.py` (Port 8000)
2. **Frontend**: `cd vite-project && npm run dev` (Port 5173 - automatically proxies `/api` calls to 8000)

---

## 🛡️ Detected Security Vulnerabilities & Standards

| Vulnerability ID | Finding Name | Severity / CVSS | Standard Audited |
| :--- | :--- | :--- | :--- |
| **SEC-CIPHER-001** | Insecure Ciphers (3DES / DES) | **CRITICAL** (9.1) | NIST SP 800-77 §4.1 / RFC 8221 |
| **SEC-IKE-001** | IKEv1 Aggressive Mode PSK Leak | **CRITICAL** (9.3) | RFC 2409 §5.1 / CIS IPsec 1.1 |
| **SEC-DH-001** | Weak DH Group (Group 1 / 2) | **CRITICAL** (8.8) | NIST SP 800-77 §4.3 / RFC 8247 |
| **SEC-HASH-001** | Broken Hash (MD5 / SHA-1) | **CRITICAL / HIGH** | NIST SP 800-131A / RFC 8221 |
| **SEC-PFS-001** | Missing Perfect Forward Secrecy | **HIGH** (6.8) | CIS IPsec 2.4 / RFC 7296 |
| **SEC-ESP-001** | ESP Replay Window Violations | **HIGH** (7.5) | RFC 4303 §3.3.3 |
| **SEC-LEAK-001** | Low Entropy / Plaintext Leakage | **CRITICAL** (8.9) | RFC 2410 / CIS IPsec 3.1 |
| **SEC-PSK-001** | Weak Pre-Shared Key Entropy | **HIGH** (7.1) | NIST SP 800-77 §4.4 |

---

## ⚡ Live Features

1. **Instant Evaluation Presets**: Don't have a PCAP file during a live demo? Click **"Vulnerable Legacy Scenario"** or **"Compliant Modern Scenario"** on the Upload page to immediately generate real-time evaluations.
2. **Interactive AI Security Advisor**: Ask natural language cybersecurity questions about the capture directly in the dashboard.
3. **Automated Gateway Hardening**: Instantly copy hardened configuration blocks for strongSwan (`/etc/ipsec.conf`), Cisco IOS (`crypto ikev2`), and Fortinet.
4. **Formal HTML Executive Report**: Export and print presentation-grade compliance reports with 1 click.
5. **Static Config Auditor**: Paste router configurations directly into `/view` to audit security without needing live traffic captures.
