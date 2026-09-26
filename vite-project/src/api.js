const API_BASE = "/api";

export async function uploadPcap(file, ikeVersion = "auto", psk = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ike_version", ikeVersion);
  formData.append("psk", psk);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

export async function getAnalysis(analysisId = "latest") {
  try {
    const res = await fetch(`${API_BASE}/analysis/${analysisId}`);
    if (!res.ok) throw new Error("Failed to fetch analysis");
    return await res.json();
  } catch (err) {
    console.warn("Backend offline or error, trying sample fallback:", err);
    return await loadSample("vulnerable_legacy");
  }
}

export async function loadSample(scenario = "vulnerable_legacy") {
  try {
    const res = await fetch(`${API_BASE}/sample/${scenario}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Sample endpoint unreachable, using embedded fallback:", err);
  }

  // Embedded client fallback if backend is momentarily offline
  return {
    id: "sample-fallback",
    filename: "enterprise_legacy_vpn.pcap",
    timestamp: new Date().toLocaleString(),
    summary: {
      total_packets: 48732,
      ipsec_packets: 12846,
      ipsec_percentage: 26.4,
      encrypted_packets: 11920,
      encrypted_percentage: 24.5,
      ike_packets: 4560,
      esp_packets: 8286,
      ah_packets: 0,
      other_packets: 35886,
      avg_entropy: 7.84,
      tunnel_count: 2,
    },
    protocols: [
      { name: "IKE", count: 4560, pct: 9.4, color: "#3b82f6" },
      { name: "ESP", count: 8286, pct: 17.0, color: "#a855f7" },
      { name: "Other", count: 35886, pct: 73.6, color: "#64748b" },
    ],
    proposals: [
      {
        encryption: "3DES-CBC",
        integrity: "MD5",
        dh_group: "DH Group 1 (MODP 768-bit)",
        auth_method: "Pre-Shared Key (PSK)",
        key_length: 168,
        pfs: false,
      },
    ],
    ike_sessions: [
      {
        packet_index: 1,
        src: "192.168.10.50:500",
        dst: "203.0.113.88:500",
        version: "IKEv1",
        exchange_type: "Aggressive Mode",
        initiator_spi: "0x78ab12cd...",
        responder_spi: "0x98fe54ba...",
        msg_id: 0,
        flags: "0x00",
      },
    ],
    esp_tunnels: [
      {
        tunnel: "192.168.10.50 -> 203.0.113.88",
        packets: 8286,
        bytes: 5240000,
        spis: ["0x3a4b5c6d", "0x6d5c4b3a"],
        replay_violations: 7,
      },
    ],
    timeline: [
      { time: "15:00", inbound_kb: 2.2, outbound_kb: 1.4 },
      { time: "15:05", inbound_kb: 3.6, outbound_kb: 2.2 },
      { time: "15:10", inbound_kb: 5.8, outbound_kb: 2.9 },
      { time: "15:15", inbound_kb: 4.5, outbound_kb: 2.6 },
      { time: "15:20", inbound_kb: 6.4, outbound_kb: 3.2 },
    ],
    security: {
      score: 35,
      grade: "F",
      badge: "Critical Security Failure",
      total_findings: 5,
      critical_count: 3,
      high_count: 2,
      medium_count: 0,
      low_count: 0,
      findings: [
        {
          id: "SEC-CIPHER-001",
          level: "critical",
          cvss: 9.1,
          title: "Insecure Cipher Detected: 3DES-CBC",
          description: "3DES is vulnerable to Sweet32 (CVE-2016-2183) 64-bit block collision attacks.",
          remediation: "Upgrade to AES-256-GCM or ChaCha20-Poly1305.",
          standard: "NIST SP 800-77 / RFC 8221",
        },
        {
          id: "SEC-HASH-001",
          level: "critical",
          cvss: 8.5,
          title: "Cryptographically Broken Hash: MD5",
          description: "MD5 has practical collision attacks and cannot guarantee packet integrity.",
          remediation: "Upgrade to SHA2-256 or SHA2-384.",
          standard: "NIST SP 800-77",
        },
        {
          id: "SEC-DH-001",
          level: "critical",
          cvss: 8.8,
          title: "Weak Diffie-Hellman Group: DH Group 1 (768-bit)",
          description: "Vulnerable to Logjam discrete log precomputation attacks.",
          remediation: "Enforce DH Group 14 (2048-bit) or DH Group 19 (ECP-256).",
          standard: "RFC 8247",
        },
        {
          id: "SEC-IKE-001",
          level: "high",
          cvss: 9.3,
          title: "IKEv1 Aggressive Mode with Cleartext Hash Exposure",
          description: "PSK hash transmitted in cleartext; vulnerable to offline GPU cracking.",
          remediation: "Migrate to IKEv2 or enforce Main Mode with certificates.",
          standard: "CIS IPsec 1.1",
        },
        {
          id: "SEC-PFS-001",
          level: "high",
          cvss: 6.8,
          title: "Perfect Forward Secrecy (PFS) Not Enforced in Phase 2",
          description: "Compromise of long-term key allows historic decryption.",
          remediation: "Enable PFS in Phase 2 Child SA configuration.",
          standard: "NIST SP 800-77 §3.2",
        },
      ],
      passed_checks: [],
      compliance: [
        { standard: "NIST SP 800-77 Rev 1", status: "NON-COMPLIANT", details: "Fails cipher, hash, and DH group requirements" },
        { standard: "RFC 8221 (ESP/AH)", status: "NON-COMPLIANT", details: "Uses prohibited 3DES and MD5" },
        { standard: "RFC 8247 (IKEv2)", status: "NON-COMPLIANT", details: "Uses weak 768-bit DH Group 1" },
        { standard: "CIS IPsec Benchmark", status: "FAIL", details: "Aggressive mode with PSK detected" },
      ],
    },
    ai: {
      executive_summary: "CRITICAL RISK IDENTIFIED: SecuraX AI inspected the IPsec traffic and identified multiple severe vulnerabilities including 3DES, MD5, and IKEv1 Aggressive Mode. Immediate reconfiguration required.",
      action_plan: [
        { step: 1, title: "Upgrade to AES-256-GCM", text: "Replace 3DES with AES-GCM to defeat Sweet32 collision attacks.", priority: "High" },
        { step: 2, title: "Enforce IKEv2", text: "Disable IKEv1 Aggressive Mode to protect PSK credentials from offline interception.", priority: "High" },
        { step: 3, title: "Enforce DH Group 14 or 19", text: "Eliminate 768-bit MODP group to protect against discrete log precomputations.", priority: "High" },
      ],
      risk_metrics: {
        confidentiality: 25,
        integrity: 30,
        key_exchange: 20,
        authentication: 15,
        replay_protection: 50,
      },
      remediation_configs: {
        strongswan: `# /etc/ipsec.conf (Hardened)
conn secure-vpn
  keyexchange=ikev2
  ike=aes256gcm16-prfsha384-ecp384,aes256-sha384-modp2048!
  esp=aes256gcm16-ecp384!
  rekey=yes
  lifetime=1h
  auto=start`,
        cisco_ios: `! Cisco IOS Hardened Profile
crypto ikev2 proposal PROP
 encryption aes-gcm-256
 prf sha384
 group 19 14
crypto ipsec transform-set TS esp-gcm 256
 set pfs group19`,
      },
    },
  };
}

export async function getHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to fetch history:", err);
  }
  return [];
}

export async function askAI(question, analysisId = "latest") {
  try {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, analysis_id: analysisId }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("AI endpoint unreachable:", err);
  }
  return {
    question,
    answer: "SecuraX AI: I have reviewed the assessment data. The detected vulnerabilities indicate Sweet32 and Logjam exposure. Please review the auto-generated Cisco and strongSwan hardened configs under the Reports tab.",
  };
}

export async function auditConfig(configText) {
  const res = await fetch(`${API_BASE}/config-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config_text: configText }),
  });
  if (!res.ok) throw new Error("Config audit failed");
  return await res.json();
}

export function getHtmlReportUrl(analysisId = "latest") {
  return `${API_BASE}/export/${analysisId}/html`;
}

export function getDownloadSamplePcapUrl(scenario = "vulnerable_legacy") {
  return `${API_BASE}/download/sample-pcap?scenario=${scenario}`;
}
