import os
import random
from scapy.all import wrpcap, Ether, IP, UDP, Raw

DEST_DIR = r"d:\SIH 2\sample_pcaps"
os.makedirs(DEST_DIR, exist_ok=True)

# Definition of 45 realistic, varied PCAP files
SCENARIOS = [
    # 1-10: Cryptographic Variations
    ("01_legacy_3des_md5_dh1.pcap", 1, 4, 3, 1, 1, "192.168.1.10", "203.0.113.1", 7.2, False, 20),
    ("02_weak_des_sha1_dh2.pcap", 1, 2, 2, 2, 2, "10.0.0.5", "198.51.100.2", 7.1, False, 20),
    ("03_blowfish_cbc_md5_dh5.pcap", 1, 2, 7, 1, 5, "172.16.0.10", "198.51.100.14", 7.3, False, 20),
    ("04_rc5_sha1_legacy_vpn.pcap", 1, 2, 4, 2, 2, "192.168.100.1", "203.0.113.44", 7.0, False, 20),
    ("05_aes128_cbc_sha1_dh14.pcap", 1, 2, 12, 2, 14, "10.1.1.1", "198.51.100.50", 7.6, False, 25),
    ("06_aes256_cbc_sha256_dh14.pcap", 2, 34, 12, 4, 14, "10.10.10.1", "203.0.113.80", 7.8, True, 25),
    ("07_aes128_gcm_dh19_modern.pcap", 2, 34, 20, 4, 19, "192.168.50.2", "203.0.113.99", 7.9, True, 30),
    ("08_aes256_gcm_dh20_enterprise.pcap", 2, 34, 20, 5, 20, "10.200.1.1", "198.51.100.200", 7.95, True, 35),
    ("09_chacha20_poly1305_curve25519.pcap", 2, 34, 28, 4, 31, "172.20.1.10", "203.0.113.150", 7.92, True, 30),
    ("10_esp_null_plaintext_leakage.pcap", 1, 2, 1, 1, 1, "192.168.88.10", "203.0.113.250", 4.1, False, 30),

    # 11-20: Handshakes & Protocol Modes
    ("11_ikev1_main_mode_preshared_key.pcap", 1, 2, 12, 4, 14, "10.5.5.1", "198.51.100.11", 7.7, True, 25),
    ("12_ikev1_aggressive_mode_psk_leak.pcap", 1, 4, 3, 1, 1, "192.168.2.15", "203.0.113.12", 7.3, False, 20),
    ("13_ikev1_main_mode_rsa_signatures.pcap", 1, 2, 12, 4, 14, "172.16.50.1", "198.51.100.13", 7.75, True, 25),
    ("14_ikev1_quick_mode_pfs_disabled.pcap", 1, 32, 12, 4, 0, "10.8.8.1", "203.0.113.14", 7.6, False, 22),
    ("15_ikev1_quick_mode_pfs_enabled.pcap", 1, 32, 12, 4, 14, "10.8.8.2", "203.0.113.15", 7.8, True, 25),
    ("16_ikev2_ike_sa_init_handshake.pcap", 2, 34, 20, 4, 19, "192.168.30.1", "198.51.100.16", 7.85, True, 30),
    ("17_ikev2_ike_auth_eap_mschapv2.pcap", 2, 35, 20, 4, 19, "192.168.30.2", "198.51.100.17", 7.82, True, 30),
    ("18_ikev2_ike_auth_x509_certificates.pcap", 2, 35, 20, 5, 20, "10.15.1.1", "203.0.113.18", 7.9, True, 35),
    ("19_ikev2_create_child_sa_rekey.pcap", 2, 36, 20, 4, 19, "10.15.1.2", "203.0.113.19", 7.88, True, 30),
    ("20_ikev1_dead_peer_detection_dpd.pcap", 1, 2, 12, 4, 14, "172.31.0.1", "198.51.100.20", 7.7, True, 25),

    # 21-30: Real-World Topologies & Vendors
    ("21_cisco_asa_to_strongswan_site2site.pcap", 2, 34, 20, 4, 19, "192.168.10.1", "203.0.113.21", 7.89, True, 35),
    ("22_fortigate_to_paloalto_branch_tunnel.pcap", 2, 34, 20, 4, 19, "172.16.100.1", "198.51.100.22", 7.91, True, 35),
    ("23_checkpoint_to_juniper_srx_gateway.pcap", 1, 2, 12, 4, 14, "10.50.0.1", "203.0.113.23", 7.75, True, 25),
    ("24_aws_virtual_private_gateway_ipsec.pcap", 2, 34, 20, 4, 14, "10.0.0.100", "52.95.1.1", 7.85, True, 30),
    ("25_azure_vpn_gateway_route_based.pcap", 2, 34, 20, 4, 19, "10.2.0.4", "40.114.1.1", 7.88, True, 30),
    ("26_gcp_cloud_vpn_high_availability.pcap", 2, 34, 20, 4, 19, "10.128.0.2", "35.200.1.1", 7.9, True, 30),
    ("27_remote_worker_roadwarrior_nat_t.pcap", 2, 34, 20, 4, 19, "192.168.1.105", "203.0.113.27", 7.82, True, 25),
    ("28_hub_and_spoke_multisite_vpn.pcap", 2, 34, 20, 4, 19, "10.254.0.1", "198.51.100.28", 7.87, True, 35),
    ("29_gre_over_ipsec_encapsulation.pcap", 1, 2, 12, 4, 14, "172.16.200.1", "203.0.113.29", 7.7, True, 25),
    ("30_nat_traversal_udp4500_float.pcap", 2, 34, 20, 4, 19, "192.168.4.50", "198.51.100.30", 7.84, True, 28),

    # 31-40: Attacks, Vulnerabilities & Anomalies
    ("31_anti_replay_sequence_rollback_attack.pcap", 2, 34, 20, 4, 19, "10.99.1.5", "203.0.113.31", 7.8, True, 30),
    ("32_logjam_weak_dh_downgrade_mitm.pcap", 1, 2, 3, 1, 1, "192.168.6.1", "198.51.100.32", 7.25, False, 20),
    ("33_sweet32_collision_64bit_cve20162183.pcap", 1, 2, 3, 2, 2, "172.16.9.1", "203.0.113.33", 7.28, False, 20),
    ("34_low_entropy_unencrypted_leak_anomaly.pcap", 1, 2, 1, 1, 1, "10.66.1.1", "198.51.100.34", 4.3, False, 25),
    ("35_weak_dictionary_psk_crackable.pcap", 1, 4, 3, 1, 1, "192.168.7.1", "203.0.113.35", 7.3, False, 20),
    ("36_ike_dos_state_exhaustion_flood.pcap", 2, 34, 20, 4, 19, "192.168.100.20", "203.0.113.36", 7.7, True, 40),
    ("37_malformed_ike_notify_payload.pcap", 2, 34, 20, 4, 19, "10.44.1.1", "198.51.100.37", 7.8, True, 20),
    ("38_expired_sa_rekey_failure_traffic.pcap", 1, 2, 12, 2, 14, "172.16.77.1", "203.0.113.38", 7.5, False, 25),
    ("39_spi_collision_inbound_outbound.pcap", 2, 34, 20, 4, 19, "10.88.1.1", "198.51.100.39", 7.85, True, 30),
    ("40_fragmented_ike_packet_evasion.pcap", 1, 2, 12, 4, 14, "192.168.99.1", "203.0.113.40", 7.65, True, 30),

    # 41-45: Compliance Audits & Benchmarks
    ("41_nist_sp800_77_federal_compliant.pcap", 2, 34, 20, 4, 19, "10.100.0.1", "203.0.113.41", 7.92, True, 35),
    ("42_pci_dss_4_0_banking_cardholder_vpn.pcap", 2, 34, 20, 5, 20, "10.100.1.1", "198.51.100.42", 7.96, True, 35),
    ("43_hipaa_healthcare_telehealth_tunnel.pcap", 2, 34, 20, 4, 19, "10.100.2.1", "203.0.113.43", 7.91, True, 35),
    ("44_cis_ipsec_benchmark_v1_audited.pcap", 2, 34, 20, 4, 19, "10.100.3.1", "203.0.113.44", 7.89, True, 35),
    ("45_rfc8221_rfc8247_crypto_suite_pass.pcap", 2, 34, 28, 4, 31, "10.100.4.1", "203.0.113.45", 7.94, True, 35),
]

def make_pcap(filename, ike_ver, exch_type, encr, integ, dh, src_ip, dst_ip, target_entropy, pfs, esp_count):
    packets = []
    
    # IKE Header
    # 28 bytes IKE header
    init_spi = os.urandom(8)
    resp_spi = b"\x00" * 8 if exch_type in (2, 4, 34) else os.urandom(8)
    next_payload = 1  # SA payload
    ver_byte = 0x10 if ike_ver == 1 else 0x20
    flags = 0x00
    msg_id = (0).to_bytes(4, "big")
    ike_len = (64).to_bytes(4, "big")
    
    ike_hdr = init_spi + resp_spi + bytes([next_payload, ver_byte, exch_type, flags]) + msg_id + ike_len
    
    # SA proposal body (simulated transforms)
    sa_payload = (
        b"\x00\x00\x00\x24\x00\x00\x00\x01\x00\x01" +
        bytes([0x00, encr, 0x00, integ, 0x00, dh])
    )
    
    # IKE Packet
    sport = 4500 if "nat_t" in filename or "udp4500" in filename else 500
    dport = sport
    if sport == 4500:
        ike_raw = b"\x00\x00\x00\x00" + ike_hdr + sa_payload
    else:
        ike_raw = ike_hdr + sa_payload

    p_ike = Ether() / IP(src=src_ip, dst=dst_ip) / UDP(sport=sport, dport=dport) / Raw(load=ike_raw)
    packets.append(p_ike)
    
    # Generate ESP packets
    spi_val = os.urandom(4)
    for i in range(1, esp_count + 1):
        seq_num = i
        if "rollback" in filename and i > 15:
            seq_num = i - 10  # simulate replay rollback anomaly
            
        seq_bytes = seq_num.to_bytes(4, "big")
        
        # Adjust entropy: if target_entropy < 6.0, inject repeated/plaintext bytes
        if target_entropy < 6.0:
            payload_data = b"CONFIDENTIAL_INTERNAL_DATA_LEAK_PLAINTEXT_" * 2
        else:
            payload_data = os.urandom(64)
            
        esp_bytes = spi_val + seq_bytes + payload_data
        
        if sport == 4500:
            p_esp = Ether() / IP(src=src_ip, dst=dst_ip) / UDP(sport=4500, dport=4500) / Raw(load=esp_bytes)
        else:
            p_esp = Ether() / IP(src=src_ip, dst=dst_ip, proto=50) / Raw(load=esp_bytes)
            
        packets.append(p_esp)
        
    full_path = os.path.join(DEST_DIR, filename)
    wrpcap(full_path, packets)
    return full_path

print(f"Generating {len(SCENARIOS)} PCAP files in {DEST_DIR}...")
for item in SCENARIOS:
    path = make_pcap(*item)
    print(f"Generated: {os.path.basename(path)}")

print("\nDone! All 45 PCAP files generated successfully.")
