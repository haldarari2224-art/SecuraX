import re
from .security_rules import IPsecSecurityAuditor

class IPsecConfigAuditor:
    """Statically parses and audits IPsec configuration files (strongSwan, Cisco, PfSense)."""

    def __init__(self, config_text: str):
        self.config_text = config_text

    def parse_and_audit(self) -> dict:
        text = self.config_text
        proposals = []
        ike_sessions = []
        psk = ""

        # Detect PSK in config
        psk_match = re.search(r'(?:psk|pre-shared-key|secret)\s*[:=]?\s*["\']?([^"\'\r\n]+)["\']?', text, re.IGNORECASE)
        if psk_match:
            psk = psk_match.group(1).strip()

        # Detect strongSwan / swanctl syntax
        # e.g.: ike = aes256-sha256-modp2048, esp = 3des-md5-modp1024
        enc_found = []
        hash_found = []
        dh_found = []

        if re.search(r"3des", text, re.IGNORECASE):
            enc_found.append("3DES-CBC")
        if re.search(r"\bdes\b", text, re.IGNORECASE) and not re.search(r"3des", text, re.IGNORECASE):
            enc_found.append("DES-CBC")
        if re.search(r"aes-?gcm", text, re.IGNORECASE) or re.search(r"aes256gcm", text, re.IGNORECASE):
            enc_found.append("AES-GCM-16")
        elif re.search(r"aes", text, re.IGNORECASE):
            enc_found.append("AES-CBC")

        if re.search(r"\bmd5\b", text, re.IGNORECASE):
            hash_found.append("MD5")
        if re.search(r"\bsha1\b|\bsha-1\b", text, re.IGNORECASE):
            hash_found.append("SHA-1")
        if re.search(r"\bsha256\b|\bsha2-256\b", text, re.IGNORECASE):
            hash_found.append("SHA2-256")

        if re.search(r"modp768|group\s*1\b", text, re.IGNORECASE):
            dh_found.append("DH Group 1 (MODP 768-bit)")
        if re.search(r"modp1024|group\s*2\b", text, re.IGNORECASE):
            dh_found.append("DH Group 2 (MODP 1024-bit)")
        if re.search(r"modp2048|group\s*14\b", text, re.IGNORECASE):
            dh_found.append("DH Group 14 (MODP 2048-bit)")
        if re.search(r"ecp256|group\s*19\b", text, re.IGNORECASE):
            dh_found.append("DH Group 19 (ECP 256-bit)")

        pfs_enabled = bool(re.search(r"pfs\s*=\s*yes|set\s+pfs|pfsgroup", text, re.IGNORECASE))
        aggressive_mode = bool(re.search(r"aggressive\s*=\s*yes|exchange_mode\s+aggressive|aggressive", text, re.IGNORECASE))

        # Default fallbacks if none detected
        enc = enc_found[0] if enc_found else "AES-CBC"
        hsh = hash_found[0] if hash_found else "SHA2-256"
        dh = dh_found[0] if dh_found else ("DH Group 14 (MODP 2048-bit)" if not aggressive_mode else "DH Group 2 (MODP 1024-bit)")

        proposals.append({
            "encryption": enc,
            "integrity": hsh,
            "dh_group": dh,
            "auth_method": "Pre-Shared Key (PSK)" if psk else "Digital Signature",
            "key_length": 256 if "256" in enc or "GCM" in enc else 168 if "3DES" in enc else 128,
            "pfs": pfs_enabled
        })

        if aggressive_mode:
            ike_sessions.append({
                "version": "IKEv1",
                "exchange_type": "Aggressive Mode",
                "src": "Peer-A (Configured)",
                "dst": "Peer-B (Configured)"
            })
        else:
            ike_sessions.append({
                "version": "IKEv2" if "ikev2" in text.lower() else "IKEv1",
                "exchange_type": "Identity Protection (Main Mode)",
                "src": "Peer-A (Configured)",
                "dst": "Peer-B (Configured)"
            })

        mock_pcap = {
            "summary": {
                "total_packets": 0,
                "ipsec_packets": 0,
                "ipsec_percentage": 100,
                "encrypted_packets": 0,
                "encrypted_percentage": 100,
                "ike_packets": 0,
                "esp_packets": 0,
                "ah_packets": 0,
                "other_packets": 0,
                "avg_entropy": 7.9,
                "tunnel_count": 1
            },
            "protocols": [{"name": "Config Audit", "count": 1, "pct": 100, "color": "#3b82f6"}],
            "ike_sessions": ike_sessions,
            "proposals": proposals,
            "esp_tunnels": [],
            "timeline": [],
            "unencrypted_leaks": []
        }

        auditor = IPsecSecurityAuditor(mock_pcap, psk=psk)
        audit_res = auditor.evaluate()
        return {
            "pcap_data": mock_pcap,
            "audit_data": audit_res
        }
