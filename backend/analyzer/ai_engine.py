import os
import json
import requests

class IPsecAIEngine:
    def __init__(self, pcap_data: dict, audit_data: dict, api_key: str = None):
        self.pcap = pcap_data
        self.audit = audit_data
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    def generate_ai_insights(self) -> dict:
        """Synthesize deep AI security insights, threat model, and auto-generated configurations."""
        score = self.audit.get("score", 100)
        findings = self.audit.get("findings", [])
        summary = self.pcap.get("summary", {})

        # Generate Executive Narrative
        narrative = self._generate_executive_narrative(score, findings, summary)

        # Generate Action Items
        actions = self._generate_action_plan(findings)

        # Generate Hardened Configuration Scripts
        configs = self._generate_hardened_configs()

        # Risk Radar metrics
        risk_metrics = {
            "confidentiality": max(10, 100 - sum(30 for f in findings if "CIPHER" in f["id"] or "LEAK" in f["id"])),
            "integrity": max(10, 100 - sum(25 for f in findings if "HASH" in f["id"])),
            "key_exchange": max(10, 100 - sum(30 for f in findings if "DH" in f["id"] or "PFS" in f["id"])),
            "authentication": max(10, 100 - sum(35 for f in findings if "IKE" in f["id"] or "PSK" in f["id"])),
            "replay_protection": max(10, 100 - sum(25 for f in findings if "ESP" in f["id"]))
        }

        return {
            "executive_summary": narrative,
            "action_plan": actions,
            "risk_metrics": risk_metrics,
            "remediation_configs": configs
        }

    def _generate_executive_narrative(self, score: int, findings: list, summary: dict) -> str:
        total_pkts = summary.get("total_packets", 0)
        ipsec_pkts = summary.get("ipsec_packets", 0)
        crit_count = sum(1 for f in findings if f["level"] == "critical")
        high_count = sum(1 for f in findings if f["level"] == "high")

        if crit_count > 0:
            return (
                f"CRITICAL RISK IDENTIFIED: SecuraX AI inspected {total_pkts:,} packets ({ipsec_pkts:,} IPsec) "
                f"and identified {crit_count} Critical and {high_count} High-severity cryptographic misconfigurations. "
                "The VPN tunnel is exposed to active or passive interception due to deprecated ciphers, weak key exchange, "
                "or aggressive mode hash leakage. Immediate remediation is required to conform with NIST SP 800-77 Rev 1 guidelines."
            )
        elif high_count > 0:
            return (
                f"MODERATE TO HIGH RISK: Analysis of {ipsec_pkts:,} IPsec packets detected configuration shortcomings "
                f"resulting in a security posture score of {score}/100. Rekeying policies or Perfect Forward Secrecy (PFS) "
                "must be updated to protect against retroactive decryption."
            )
        else:
            return (
                f"STRONG SECURITY POSTURE: Analyzed {ipsec_pkts:,} IPsec packets with an overall score of {score}/100. "
                "Modern AES cipher suites and robust Diffie-Hellman groups are properly negotiated without critical protocol leaks."
            )

    def _generate_action_plan(self, findings: list) -> list:
        plan = []
        for idx, f in enumerate(findings):
            priority = "High" if f["level"] in ("critical", "high") else "Medium"
            plan.append({
                "step": idx + 1,
                "title": f["title"],
                "text": f["remediation"],
                "priority": priority,
                "standard": f.get("standard", "NIST SP 800-77"),
                "cvss": f.get("cvss", 5.0)
            })
        if not plan:
            plan.append({
                "step": 1,
                "title": "Maintain Rekeying and Certificate Lifecycle",
                "text": "Continue periodic certificate renewal and monitor endpoint logs for SA negotiation anomalies.",
                "priority": "Medium",
                "standard": "CIS IPsec 1.0",
                "cvss": 0.0
            })
        return plan

    def _generate_hardened_configs(self) -> dict:
        """Provide drop-in secure configurations for common enterprise gateways."""
        strongswan_conf = """# /etc/ipsec.conf - Hardened strongSwan IPsec Configuration
config setup
    charondebug="ike 2, knl 2, cfg 2"
    uniqueids=yes

conn %default
    keyexchange=ikev2
    ike=aes256gcm16-prfsha384-ecp384,aes256-sha384-modp2048!
    esp=aes256gcm16-ecp384,aes256-sha384-modp2048!
    dpdaction=restart
    dpddelay=30s
    dpdtimeout=120s
    rekey=yes
    ikelifetime=3h
    lifetime=1h
    margintime=9m
    rekeyfuzz=100%

conn secure-site-to-site
    left=192.168.1.1
    leftid=@gw1.corporate.internal
    leftsubnet=10.10.0.0/16
    leftauth=pubkey
    right=203.0.113.1
    rightid=@gw2.corporate.internal
    rightsubnet=10.20.0.0/16
    rightauth=pubkey
    auto=start
"""

        cisco_ios = """! Cisco IOS-XE Hardened IKEv2 / IPsec Configuration
crypto ikev2 proposal SECURE-IKEV2-PROP
 encryption aes-gcm-256
 prf sha384
 group 19 20 14

crypto ikev2 policy SECURE-IKEV2-POLICY
 proposal SECURE-IKEV2-PROP

crypto ipsec transform-set SECURE-IPSEC-TS esp-gcm 256
 mode tunnel

crypto ipsec profile SECURE-IPSEC-PROFILE
 set transform-set SECURE-IPSEC-TS
 set pfs group19
 set security-association lifetime seconds 3600
"""

        fortinet_cli = """# FortiGate CLI Hardened Phase 1 & 2
config vpn ipsec phase1-interface
    edit "To-Remote-HQ"
        set interface "wan1"
        set ike-version 2
        set proposal aes256gcm-prfsha384 aes256-sha384
        set dhgrp 19 14
        set keylife 10800
    next
end

config vpn ipsec phase2-interface
    edit "To-Remote-HQ-P2"
        set phase1name "To-Remote-HQ"
        set proposal aes256gcm aes256-sha256
        set pfs enable
        set dhgrp 19 14
        set keylifeseconds 3600
    next
end
"""

        return {
            "strongswan": strongswan_conf,
            "cisco_ios": cisco_ios,
            "fortinet": fortinet_cli
        }

    def ask(self, question: str) -> str:
        """Handle interactive user Q&A about the IPsec analysis."""
        q_lower = question.lower()

        # If Gemini API Key is present, call Gemini REST API
        if self.api_key:
            try:
                gemini_res = self._call_gemini_api(question)
                if gemini_res:
                    return gemini_res
            except Exception:
                pass  # Fall back to offline intelligence engine

        # Offline Expert Cybersecurity Intelligence Rules
        if "aggressive mode" in q_lower or "aggressive" in q_lower:
            return (
                "**IKEv1 Aggressive Mode Analysis**:\n\n"
                "In Aggressive Mode, the authentication hash (which includes the Pre-Shared Key) "
                "is transmitted in cleartext in the very second packet of the handshake without identity protection. "
                "Attackers capturing this packet can run offline dictionary and brute-force attacks using tools like "
                "Hashcat (`mode 5400`) or `ike-scan --crack`. Because it happens offline, rate limiting on the VPN firewall cannot prevent cracking. "
                "\n\n**Remediation**: Migrate immediately to IKEv2 (RFC 7296), which completely eliminates Aggressive Mode."
            )
        elif "dh" in q_lower or "diffie-hellman" in q_lower or "group 1" in q_lower or "group 2" in q_lower:
            return (
                "**Diffie-Hellman Group Assessment**:\n\n"
                "Diffie-Hellman groups determine the strength of the shared secret created during Phase 1/Phase 2 key exchange. "
                "MODP groups with key lengths under 2048 bits (Group 1: 768-bit, Group 2: 1024-bit, Group 5: 1536-bit) "
                "are susceptible to precomputed discrete logarithm attacks (the Logjam vulnerability). "
                "\n\n**Best Practice**: Enforce DH Group 14 (MODP 2048-bit) as an absolute minimum, or preferably Elliptic Curve "
                "Diffie-Hellman groups: Group 19 (ECP 256-bit, equivalent to 3072-bit RSA) or Curve25519 (Group 31)."
            )
        elif "sweet32" in q_lower or "3des" in q_lower or "des" in q_lower:
            return (
                "**3DES & Sweet32 Vulnerability (CVE-2016-2183)**:\n\n"
                "Triple DES uses a 64-bit block size. Due to the birthday paradox, after transmitting approximately 32GB of data "
                "under the same key (around 2^32 blocks), ciphertext collisions occur. An eavesdropper observing collision blocks "
                "can recover the underlying plaintext (such as HTTP session cookies or credentials). "
                "\n\n**Remediation**: Disable `3des-cbc` and `des-cbc`. Transition to modern 128-bit block ciphers like AES-GCM-256."
            )
        elif "pfs" in q_lower or "forward secrecy" in q_lower:
            return (
                "**Perfect Forward Secrecy (PFS)**:\n\n"
                "When PFS is disabled, Phase 2 Child SA encryption keys are derived directly from the Phase 1 master key. "
                "If the long-term private key or Phase 1 secret is compromised in the future, all historically recorded VPN sessions "
                "can be retroactively decrypted. Enforcing PFS forces an independent Diffie-Hellman exchange during Child SA rekeying, "
                "ensuring compromise of one session does not compromise any past or future sessions."
            )
        elif "rekey" in q_lower or "lifetime" in q_lower:
            return (
                "**SA Rekeying & Lifetime Policy**:\n\n"
                "Security Associations should have enforced lifetime limits in both time (seconds) and data volume (bytes). "
                "NIST SP 800-77 recommends: Phase 1 IKE SA lifetime between 8 to 24 hours, and Phase 2 Child SA lifetime of 1 hour (3600s) "
                "or 4 hours maximum, with rekeying initiated before the SA expires to prevent traffic interruption."
            )
        elif "entropy" in q_lower or "leak" in q_lower:
            return (
                "**Shannon Entropy & ESP Payload Leakage**:\n\n"
                "True encrypted ciphertext resembles random white noise with high Shannon entropy (> 7.5 bits per byte). "
                "If an ESP packet shows entropy below 6.2, it signals that uncompressed plaintext, null encryption (ESP-NULL), "
                "or broken padding is being transmitted. This must be investigated immediately for split-tunnel or cipher misconfigurations."
            )
        else:
            findings_summary = ", ".join([f["title"] for f in self.audit.get("findings", [])[:3]]) or "no critical vulnerabilities"
            return (
                f"**SecuraX AI Assessment Summary**:\n\n"
                f"The analyzed IPsec capture received an overall security score of **{self.audit.get('score', 100)}/100** ({self.audit.get('badge', 'Reviewed')}). "
                f"The top security findings identified are: **{findings_summary}**. "
                "\n\nTo remediate, review the auto-generated hardened configurations for strongSwan or Cisco IOS under the Reports and Security tabs."
            )

    def _call_gemini_api(self, prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        context = {
            "score": self.audit.get("score"),
            "findings": self.audit.get("findings"),
            "summary": self.pcap.get("summary")
        }
        system_instruction = (
            "You are SecuraX AI, an elite cybersecurity and IPsec VPN protocol expert. "
            "Explain network security, cryptography, and remediation clearly based on the provided IPsec capture findings."
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"System Context: {json.dumps(context)}\n\nUser Question: {prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600
            }
        }
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        return ""
