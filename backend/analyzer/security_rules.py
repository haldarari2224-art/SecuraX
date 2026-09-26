import re

class IPsecSecurityAuditor:
    def __init__(self, pcap_results: dict, psk: str = ""):
        self.pcap = pcap_results
        self.psk = psk
        self.findings = []
        self.passed_checks = []
        self.score = 100

    def evaluate(self) -> dict:
        proposals = self.pcap.get("proposals", [])
        ike_sessions = self.pcap.get("ike_sessions", [])
        esp_tunnels = self.pcap.get("esp_tunnels", [])
        unencrypted_leaks = self.pcap.get("unencrypted_leaks", [])

        # 1. Audit Cryptographic Proposals
        self._audit_encryption_ciphers(proposals)
        self._audit_hash_algorithms(proposals)
        self._audit_dh_groups(proposals)
        self._audit_pfs(proposals)

        # 2. Audit IKE Exchanges & Aggressive Mode
        self._audit_ike_modes(ike_sessions)

        # 3. Audit ESP Tunnels & Replay Protection
        self._audit_esp_tunnels(esp_tunnels)

        # 4. Audit Unencrypted / Plaintext Leaks
        self._audit_leakage(unencrypted_leaks)

        # 5. Audit PSK strength if provided
        if self.psk:
            self._audit_psk_strength(self.psk)

        # Calculate final security score
        self._calculate_final_score()

        # Grade determination
        grade, badge = self._get_grade()

        # Compliance checklist (NIST SP 800-77, RFC 8221, CIS Benchmark)
        compliance = self._generate_compliance_matrix()

        return {
            "score": self.score,
            "grade": grade,
            "badge": badge,
            "total_findings": len(self.findings),
            "critical_count": sum(1 for f in self.findings if f["level"] == "critical"),
            "high_count": sum(1 for f in self.findings if f["level"] == "high"),
            "medium_count": sum(1 for f in self.findings if f["level"] == "medium"),
            "low_count": sum(1 for f in self.findings if f["level"] == "low"),
            "findings": self.findings,
            "passed_checks": self.passed_checks,
            "compliance": compliance
        }

    def _audit_encryption_ciphers(self, proposals):
        found_deprecated = False
        found_aead = False

        for p in proposals:
            enc = p.get("encryption", "")
            if any(legacy in enc for legacy in ["3DES", "DES", "Blowfish", "RC5", "CAST"]):
                found_deprecated = True
                self.findings.append({
                    "id": "SEC-CIPHER-001",
                    "level": "critical",
                    "cvss": 9.1,
                    "title": f"Insecure Cipher Detected: {enc}",
                    "description": f"The IPsec negotiation proposal includes {enc}, which is cryptographically deprecated. 3DES and 64-bit block ciphers are vulnerable to the Sweet32 birthday collision attack (CVE-2016-2183), while DES keys (56-bit) can be brute-forced in hours.",
                    "impact": "An adversary capturing traffic can decrypt sensitive payload data without knowing the long-term credentials.",
                    "remediation": "Disable 3DES and DES across all Phase 1 and Phase 2 proposals. Enforce AES-256-GCM, AES-128-GCM, or ChaCha20-Poly1305.",
                    "standard": "NIST SP 800-77 §4.1 / RFC 8221 §5",
                    "deduction": 35
                })
            elif "GCM" in enc or "ChaCha20" in enc:
                found_aead = True

        if not found_deprecated:
            self.passed_checks.append({
                "check": "Modern Encryption Ciphers",
                "status": "PASS",
                "details": "Strong encryption algorithms (AES variants) configured without legacy 64-bit block ciphers."
            })
            if not found_aead and any("CBC" in p.get("encryption", "") for p in proposals):
                self.findings.append({
                    "id": "SEC-CIPHER-002",
                    "level": "medium",
                    "cvss": 5.4,
                    "title": "Legacy CBC Mode in Use (AES-CBC)",
                    "description": "AES-CBC requires separate MAC calculation and is vulnerable to padding oracle attacks if not implemented with constant-time HMAC validation.",
                    "impact": "Padding oracle side-channel exposure if termination endpoint has subtle error message latency discrepancies.",
                    "remediation": "Migrate to AEAD (Authenticated Encryption with Associated Data) ciphers like AES-GCM (128 or 256 bits).",
                    "standard": "RFC 8221 §5 / NIST SP 800-77 Rev 1",
                    "deduction": 10
                })

    def _audit_hash_algorithms(self, proposals):
        for p in proposals:
            hsh = p.get("integrity", "")
            if "MD5" in hsh:
                self.findings.append({
                    "id": "SEC-HASH-001",
                    "level": "critical",
                    "cvss": 8.5,
                    "title": "Cryptographically Broken Hash: MD5",
                    "description": "MD5 suffers from known practical collision attacks and must not be used for packet authentication or integrity verification.",
                    "impact": "Integrity spoofing and forged packet injection.",
                    "remediation": "Upgrade hash algorithm to SHA2-256, SHA2-384, or SHA2-512.",
                    "standard": "NIST SP 800-77 / RFC 8221 §4",
                    "deduction": 25
                })
            elif "SHA-1" in hsh or "SHA1" in hsh:
                self.findings.append({
                    "id": "SEC-HASH-002",
                    "level": "high",
                    "cvss": 7.4,
                    "title": "Deprecated Integrity Algorithm: SHA-1",
                    "description": "SHA-1 is deprecated across all security standards due to collision vulnerabilities demonstrated by the SHAttered and Shambles attacks.",
                    "impact": "Potential collision vulnerability under targeted adversary resource access.",
                    "remediation": "Replace with SHA2-256 or SHA2-384.",
                    "standard": "NIST SP 800-131A / RFC 8247 §3",
                    "deduction": 15
                })
            else:
                self.passed_checks.append({
                    "check": "Cryptographic Hash Strength",
                    "status": "PASS",
                    "details": f"Secure integrity algorithm in use: {hsh or 'SHA-2'}"
                })

    def _audit_dh_groups(self, proposals):
        weak_groups = ["Group 1", "Group 2", "Group 5", "768-bit", "1024-bit", "1536-bit"]
        found_weak_dh = False

        for p in proposals:
            dh = p.get("dh_group", "")
            if any(wg in dh for wg in weak_groups):
                found_weak_dh = True
                self.findings.append({
                    "id": "SEC-DH-001",
                    "level": "critical",
                    "cvss": 8.8,
                    "title": f"Weak Diffie-Hellman Group: {dh}",
                    "description": f"The key exchange uses {dh}. Modulus sizes under 2048 bits (DH Groups 1, 2, and 5) are susceptible to the Logjam discrete log precomputation attack.",
                    "impact": "Passive wiretapper can compute the session key and decrypt all tunnel traffic.",
                    "remediation": "Enforce DH Group 14 (MODP 2048-bit) as baseline, or prefer elliptic curve groups: DH Group 19 (ECP 256), Group 20 (ECP 384), or Curve25519 (Group 31).",
                    "standard": "NIST SP 800-77 Rev 1 §4.3 / RFC 8247",
                    "deduction": 30
                })

        if not found_weak_dh:
            self.passed_checks.append({
                "check": "Diffie-Hellman Modulus Length",
                "status": "PASS",
                "details": "DH Groups >= 2048-bit or Elliptic Curve (ECP-256+) configured."
            })

    def _audit_pfs(self, proposals):
        no_pfs = any(p.get("pfs") is False for p in proposals)
        if no_pfs:
            self.findings.append({
                "id": "SEC-PFS-001",
                "level": "high",
                "cvss": 6.8,
                "title": "Perfect Forward Secrecy (PFS) Not Enforced in Phase 2",
                "description": "Child SA / Quick Mode negotiations do not mandate an independent Diffie-Hellman key exchange for each IPsec session key.",
                "impact": "If the primary master secret is ever compromised, all previously captured historic traffic can be retroactively decrypted.",
                "remediation": "Enable PFS on Phase 2 / Child SA (e.g. `pfs=yes`, DH Group 14 or higher).",
                "standard": "NIST SP 800-77 §3.2 / CIS IPsec 2.4",
                "deduction": 15
            })
        else:
            self.passed_checks.append({
                "check": "Perfect Forward Secrecy (PFS)",
                "status": "PASS",
                "details": "PFS is enforced, guaranteeing session independence against retroactive key compromise."
            })

    def _audit_ike_modes(self, ike_sessions):
        for s in ike_sessions:
            exchange = s.get("exchange_type", "")
            ver = s.get("version", "")
            if "Aggressive" in exchange:
                self.findings.append({
                    "id": "SEC-IKE-001",
                    "level": "critical",
                    "cvss": 9.3,
                    "title": "IKEv1 Aggressive Mode Detected with Cleartext Hash Exposure",
                    "description": "The VPN initiates IKEv1 Aggressive Mode. In Aggressive Mode, the authentication hash (based on the Pre-Shared Key) is sent in plaintext in the second packet without identity protection.",
                    "impact": "Any attacker sniffing the local or transit network can capture the hash and execute fast offline dictionary or GPU brute-force attacks (Hashcat mode 5400) to recover the PSK.",
                    "remediation": "Immediately migrate to IKEv2. If IKEv1 is temporarily required, switch to Main Mode (Identity Protection) and disable Aggressive Mode.",
                    "standard": "RFC 2409 §5.1 / CIS IPsec Benchmark 1.1",
                    "deduction": 40
                })
            elif ver == "IKEv1":
                self.findings.append({
                    "id": "SEC-IKE-002",
                    "level": "medium",
                    "cvss": 5.0,
                    "title": "Legacy IKEv1 Protocol in Use",
                    "description": "IKEv1 has been deprecated by the IETF in favor of IKEv2 (RFC 7296). IKEv1 requires more round-trips, has higher latency, and lacks native asymmetric auth flexibility.",
                    "impact": "Greater attack surface, susceptibility to amplification DoS, and missing modern cryptographic negotiation features.",
                    "remediation": "Upgrade tunnel configuration to IKEv2.",
                    "standard": "RFC 7296 / RFC 8247",
                    "deduction": 8
                })

    def _audit_esp_tunnels(self, esp_tunnels):
        for t in esp_tunnels:
            replay_viol = t.get("replay_violations", 0)
            if replay_viol > 0:
                self.findings.append({
                    "id": "SEC-ESP-001",
                    "level": "high",
                    "cvss": 7.5,
                    "title": f"ESP Replay Protection Violations ({replay_viol} Packets)",
                    "description": f"Encountered non-monotonic or repeating sequence numbers for tunnel {t.get('tunnel')}. This can indicate replay attacks, packet injection, or misconfigured anti-replay windows.",
                    "impact": "Risk of duplicate transaction processing or denial of service through sequence spoofing.",
                    "remediation": "Verify that anti-replay windowing is active, check for multipath routing reordering, and enable 64-bit Extended Sequence Numbers (ESN).",
                    "standard": "RFC 4303 §3.3.3 / NIST SP 800-77",
                    "deduction": 20
                })

    def _audit_leakage(self, unencrypted_leaks):
        if unencrypted_leaks:
            self.findings.append({
                "id": "SEC-LEAK-001",
                "level": "critical",
                "cvss": 8.9,
                "title": f"Potential Plaintext Leak Inside ESP Tunnel ({len(unencrypted_leaks)} events)",
                "description": "Packets encapsulated inside ESP exhibited Shannon entropy significantly lower than random ciphertext (< 6.2 bits/byte). This strongly suggests null encryption (ESP-NULL / RFC 2410) or unencrypted packet bypass.",
                "impact": "Total confidentiality loss for communications expected to be protected by the VPN tunnel.",
                "remediation": "Audit crypto map configuration to ensure `esp-null` transform is prohibited.",
                "standard": "RFC 2410 / CIS IPsec 3.1",
                "deduction": 35
            })

    def _audit_psk_strength(self, psk: str):
        if len(psk) < 16:
            self.findings.append({
                "id": "SEC-PSK-001",
                "level": "high",
                "cvss": 7.1,
                "title": "Weak Pre-Shared Key (Length < 16 characters)",
                "description": f"The configured PSK is only {len(psk)} characters long. Short PSKs are vulnerable to dictionary attacks and cloud rainbow table lookup.",
                "impact": "Compromise of the PSK allows unauthorized peers to authenticate and decrypt VPN sessions.",
                "remediation": "Generate a cryptographically random PSK with at least 32 alphanumeric and symbol characters, or migrate to X.509 PKI certificates.",
                "standard": "NIST SP 800-77 Rev 1 §4.4",
                "deduction": 20
            })
        elif not re.search(r"[A-Z]", psk) or not re.search(r"[0-9]", psk) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", psk):
            self.findings.append({
                "id": "SEC-PSK-002",
                "level": "medium",
                "cvss": 5.2,
                "title": "Low Complexity Pre-Shared Key",
                "description": "The PSK lacks mixed character classes (uppercase, digits, special characters).",
                "impact": "Reduced entropy against targeted wordlist attacks.",
                "remediation": "Enforce high-entropy random keys generated with `openssl rand -base64 32`.",
                "standard": "CIS Benchmark 1.4",
                "deduction": 10
            })
        else:
            self.passed_checks.append({
                "check": "Pre-Shared Key Complexity",
                "status": "PASS",
                "details": f"High-entropy PSK ({len(psk)} chars) with diverse character set."
            })

    def _calculate_final_score(self):
        total_deduction = sum(f.get("deduction", 10) for f in self.findings)
        self.score = max(5, 100 - total_deduction)

    def _get_grade(self):
        if self.score >= 90:
            return "A", "Secure & Compliant"
        elif self.score >= 75:
            return "B", "Acceptable / Minor Risks"
        elif self.score >= 60:
            return "C", "Moderate Vulnerabilities"
        elif self.score >= 40:
            return "D", "High Risk Posture"
        else:
            return "F", "Critical Security Failure"

    def _generate_compliance_matrix(self):
        has_crit = any(f["level"] == "critical" for f in self.findings)
        has_high = any(f["level"] == "high" for f in self.findings)

        return [
            {
                "standard": "NIST SP 800-77 Rev 1 (IPsec Guide)",
                "status": "NON-COMPLIANT" if (has_crit or has_high) else "COMPLIANT",
                "details": "Requires AES-GCM or AES-CBC with SHA-2, DH Group >= 14, and PFS."
            },
            {
                "standard": "RFC 8221 (ESP & AH Requirements)",
                "status": "NON-COMPLIANT" if any("SEC-CIPHER" in f["id"] or "SEC-HASH" in f["id"] for f in self.findings) else "COMPLIANT",
                "details": "Forbids 3DES, DES, and MD5. Mandates AES-GCM or AES-CTR."
            },
            {
                "standard": "RFC 8247 (IKEv2 Cryptographic Guidelines)",
                "status": "NON-COMPLIANT" if any("SEC-DH" in f["id"] or "SEC-IKE" in f["id"] for f in self.findings) else "COMPLIANT",
                "details": "Requires DH Groups >= 14, deprecates IKEv1 Aggressive Mode."
            },
            {
                "standard": "CIS IPsec Benchmark v1.2",
                "status": "FAIL" if has_crit else "WARNING" if has_high else "PASS",
                "details": "Enforces strong PSK entropy, disables Aggressive Mode, mandates rekeying."
            }
        ]
