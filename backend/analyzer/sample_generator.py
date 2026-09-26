import os
from collections import defaultdict

try:
    from scapy.all import wrpcap, Ether, IP, UDP, Raw
except ImportError:
    wrpcap = None

SAMPLE_SCENARIOS = {
    "vulnerable_legacy": {
        "name": "Legacy Enterprise Gateway (Vulnerable)",
        "description": "IKEv1 Aggressive Mode with 3DES, MD5, and DH Group 1 (Logjam & Sweet32 vulnerable)",
        "summary": {
            "total_packets": 34820,
            "ipsec_packets": 14210,
            "ipsec_percentage": 40.8,
            "encrypted_packets": 11300,
            "encrypted_percentage": 32.5,
            "ike_packets": 2910,
            "esp_packets": 11300,
            "ah_packets": 0,
            "other_packets": 20610,
            "avg_entropy": 7.32,
            "tunnel_count": 2
        },
        "protocols": [
            {"name": "IKE", "count": 2910, "pct": 8.4, "color": "#3b82f6"},
            {"name": "ESP", "count": 11300, "pct": 32.5, "color": "#a855f7"},
            {"name": "Other", "count": 20610, "pct": 59.1, "color": "#64748b"}
        ],
        "ike_sessions": [
            {
                "packet_index": 2,
                "src": "192.168.10.50:500",
                "dst": "203.0.113.88:500",
                "version": "IKEv1",
                "exchange_type": "Aggressive Mode",
                "initiator_spi": "0x78ab12cd...",
                "responder_spi": "0x98fe54ba...",
                "msg_id": 0,
                "flags": "0x00",
                "proposals": [
                    {
                        "encryption": "3DES-CBC",
                        "integrity": "MD5",
                        "dh_group": "DH Group 1 (MODP 768-bit)",
                        "auth_method": "Pre-Shared Key (PSK)",
                        "key_length": 168,
                        "pfs": False
                    }
                ]
            }
        ],
        "proposals": [
            {
                "encryption": "3DES-CBC",
                "integrity": "MD5",
                "dh_group": "DH Group 1 (MODP 768-bit)",
                "auth_method": "Pre-Shared Key (PSK)",
                "key_length": 168,
                "pfs": False
            }
        ],
        "esp_tunnels": [
            {
                "tunnel": "192.168.10.50 -> 203.0.113.88",
                "packets": 11300,
                "bytes": 7450200,
                "spis": ["0x3a4b5c6d", "0x6d5c4b3a"],
                "replay_violations": 14
            }
        ],
        "timeline": [
            {"time": "15:00", "inbound_kb": 2.2, "outbound_kb": 1.4, "inbound_pkts": 18, "outbound_pkts": 12},
            {"time": "15:05", "inbound_kb": 3.6, "outbound_kb": 2.2, "inbound_pkts": 32, "outbound_pkts": 20},
            {"time": "15:10", "inbound_kb": 5.8, "outbound_kb": 2.9, "inbound_pkts": 45, "outbound_pkts": 25},
            {"time": "15:15", "inbound_kb": 4.5, "outbound_kb": 2.6, "inbound_pkts": 38, "outbound_pkts": 22},
            {"time": "15:20", "inbound_kb": 6.4, "outbound_kb": 3.2, "inbound_pkts": 54, "outbound_pkts": 30},
        ],
        "unencrypted_leaks": [
            {
                "src": "192.168.10.50",
                "dst": "203.0.113.88",
                "spi": "0x3a4b5c6d",
                "seq": 1420,
                "entropy": 5.48,
                "note": "Low entropy payload detected. Probable ESP-NULL cleartext leak."
            }
        ],
        "sample_psk": "cisco123"
    },
    "modern_compliant": {
        "name": "Modern NIST Compliant IKEv2 Tunnel",
        "description": "IKEv2 with AES-256-GCM, DH Group 19 (ECP 256), and enforced PFS",
        "summary": {
            "total_packets": 52400,
            "ipsec_packets": 41200,
            "ipsec_percentage": 78.6,
            "encrypted_packets": 39800,
            "encrypted_percentage": 75.9,
            "ike_packets": 1400,
            "esp_packets": 39800,
            "ah_packets": 0,
            "other_packets": 11200,
            "avg_entropy": 7.94,
            "tunnel_count": 1
        },
        "protocols": [
            {"name": "IKE", "count": 1400, "pct": 2.7, "color": "#3b82f6"},
            {"name": "ESP", "count": 39800, "pct": 75.9, "color": "#a855f7"},
            {"name": "Other", "count": 11200, "pct": 21.4, "color": "#64748b"}
        ],
        "ike_sessions": [
            {
                "packet_index": 1,
                "src": "10.0.1.5:500",
                "dst": "198.51.100.10:500",
                "version": "IKEv2",
                "exchange_type": "IKE_SA_INIT",
                "initiator_spi": "0x123456789abcdef0",
                "responder_spi": "0x0fedcba987654321",
                "msg_id": 0,
                "flags": "0x08",
                "proposals": [
                    {
                        "encryption": "AES-GCM-16",
                        "integrity": "SHA2-256",
                        "dh_group": "DH Group 19 (ECP 256-bit)",
                        "auth_method": "Digital Signature",
                        "key_length": 256,
                        "pfs": True
                    }
                ]
            }
        ],
        "proposals": [
            {
                "encryption": "AES-GCM-16",
                "integrity": "SHA2-256",
                "dh_group": "DH Group 19 (ECP 256-bit)",
                "auth_method": "Digital Signature",
                "key_length": 256,
                "pfs": True
            }
        ],
        "esp_tunnels": [
            {
                "tunnel": "10.0.1.5 -> 198.51.100.10",
                "packets": 39800,
                "bytes": 28540000,
                "spis": ["0x89abcdef", "0xfedcba98"],
                "replay_violations": 0
            }
        ],
        "timeline": [
            {"time": "10:00", "inbound_kb": 12.4, "outbound_kb": 18.2, "inbound_pkts": 85, "outbound_pkts": 120},
            {"time": "10:05", "inbound_kb": 15.8, "outbound_kb": 22.4, "inbound_pkts": 98, "outbound_pkts": 140},
            {"time": "10:10", "inbound_kb": 14.1, "outbound_kb": 19.5, "inbound_pkts": 90, "outbound_pkts": 125},
            {"time": "10:15", "inbound_kb": 16.5, "outbound_kb": 24.1, "inbound_pkts": 105, "outbound_pkts": 155},
            {"time": "10:20", "inbound_kb": 18.9, "outbound_kb": 28.0, "inbound_pkts": 120, "outbound_pkts": 180},
        ],
        "unencrypted_leaks": [],
        "sample_psk": "K8#vP!9m$Lq2@zW4*Rt7#Yx1^Bn6&Qe3"
    }
}


def generate_sample_pcap_file(filepath: str, scenario_key: str = "vulnerable_legacy") -> str:
    """Generate an actual binary .pcap file on disk using Scapy that matches the scenario."""
    if wrpcap is None:
        return ""

    packets = []
    # Build IKE UDP packet
    # UDP 500
    ike_header = (
        b"\x11\x22\x33\x44\x55\x66\x77\x88"  # Initiator SPI
        b"\x00\x00\x00\x00\x00\x00\x00\x00"  # Responder SPI
        b"\x01"                              # Next payload: SA (1)
        b"\x10"                              # Version: IKEv1
        b"\x04" if scenario_key == "vulnerable_legacy" else b"\x22"  # Aggressive Mode (4) vs IKE_SA_INIT (34)
        b"\x00"                              # Flags
        b"\x00\x00\x00\x00"                  # Msg ID
        b"\x00\x00\x00\x40"                  # Length: 64
    )
    # SA proposal payload with 3DES/MD5 or AES/SHA2
    if scenario_key == "vulnerable_legacy":
        sa_body = b"\x00\x00\x00\x24\x00\x00\x00\x01\x00\x01\x00\x03\x00\x02\x00\x01\x00\x04\x00\x01"
    else:
        sa_body = b"\x00\x00\x00\x24\x00\x00\x00\x01\x00\x01\x00\x14\x00\x02\x00\x04\x00\x04\x00\x13"

    pkt1 = Ether() / IP(src="192.168.10.50", dst="203.0.113.88") / UDP(sport=500, dport=500) / Raw(load=ike_header + sa_body)
    packets.append(pkt1)

    # Add ESP packets
    for i in range(1, 25):
        esp_payload = (b"\x12\x34\x56\x78" + i.to_bytes(4, "big") + os.urandom(64))
        pkt_esp = Ether() / IP(src="192.168.10.50", dst="203.0.113.88", proto=50) / Raw(load=esp_payload)
        packets.append(pkt_esp)

    wrpcap(filepath, packets)
    return filepath
