"""
Comprehensive Test Script to verify SecuraX Backend Analyzer & Security Assessment Framework
"""
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analyzer.sample_generator import SAMPLE_SCENARIOS, generate_sample_pcap_file
from analyzer.pcap_parser import IPsecPCAPParser
from analyzer.security_rules import IPsecSecurityAuditor
from analyzer.ai_engine import IPsecAIEngine
from analyzer.config_auditor import IPsecConfigAuditor


def test_sample_scenarios():
    print("[1/5] Testing Sample Scenarios Evaluation...")
    for key, scenario in SAMPLE_SCENARIOS.items():
        auditor = IPsecSecurityAuditor(scenario, psk=scenario.get("sample_psk", ""))
        audit_res = auditor.evaluate()
        print(f"  -> Scenario '{key}': Score={audit_res['score']}/100, Grade={audit_res['grade']}, Findings={audit_res['total_findings']}")
        assert audit_res["score"] is not None
        assert audit_res["grade"] is not None


def test_pcap_generation_and_parsing():
    print("[2/5] Testing Binary PCAP Generation and Parsing...")
    tmp_pcap = os.path.join(os.path.dirname(__file__), "test_capture.pcap")
    generate_sample_pcap_file(tmp_pcap, "vulnerable_legacy")
    assert os.path.exists(tmp_pcap), "PCAP file was not created!"

    parser = IPsecPCAPParser(tmp_pcap, psk="cisco123")
    parsed_res = parser.parse()
    print(f"  -> Parsed {parsed_res['summary']['total_packets']} packets, {parsed_res['summary']['ipsec_packets']} IPsec packets")
    assert parsed_res["summary"]["total_packets"] > 0

    auditor = IPsecSecurityAuditor(parsed_res, psk="cisco123")
    audit_res = auditor.evaluate()
    print(f"  -> Audit of generated PCAP: Score={audit_res['score']}/100 ({audit_res['badge']})")
    
    # Cleanup test capture
    if os.path.exists(tmp_pcap):
        os.remove(tmp_pcap)


def test_ai_engine():
    print("[3/5] Testing AI Engine Synthesis & Q&A...")
    scenario = SAMPLE_SCENARIOS["vulnerable_legacy"]
    auditor = IPsecSecurityAuditor(scenario, psk="test123")
    audit_res = auditor.evaluate()
    ai = IPsecAIEngine(scenario, audit_res)

    insights = ai.generate_ai_insights()
    assert "executive_summary" in insights
    assert len(insights["action_plan"]) > 0
    assert "strongswan" in insights["remediation_configs"]
    print(f"  -> AI Executive Narrative: {insights['executive_summary'][:80]}...")

    q1 = ai.ask("Why is IKEv1 Aggressive Mode dangerous?")
    print(f"  -> AI Q&A Check: {q1[:70]}...")
    assert "Aggressive Mode" in q1


def test_config_auditor():
    print("[4/5] Testing Static IPsec Configuration Auditor...")
    sample_cfg = """
    crypto ikev2 proposal PROP
     encryption 3des
     integrity md5
     group 1
    crypto ipsec transform-set TS esp-3des esp-md5-hmac
    """
    auditor = IPsecConfigAuditor(sample_cfg)
    res = auditor.parse_and_audit()
    audit_res = res["audit_data"]
    print(f"  -> Static Config Audit: Score={audit_res['score']}/100, Findings={audit_res['total_findings']}")
    assert audit_res["score"] < 60, "Legacy 3DES/MD5 config must receive low score!"


def main():
    print("=" * 65)
    print("SecuraX IPsec VPN Protocol Analyzer - System Verification Test")
    print("=" * 65)
    test_sample_scenarios()
    test_pcap_generation_and_parsing()
    test_ai_engine()
    test_config_auditor()
    print("=" * 65)
    print("ALL TESTS PASSED SUCCESSFULLY! BACKEND PIPELINE 100% OPERATIONAL.")
    print("=" * 65)


if __name__ == "__main__":
    main()
