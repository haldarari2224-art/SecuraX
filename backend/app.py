import os
import json
import uuid
from datetime import datetime
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from analyzer.pcap_parser import IPsecPCAPParser
from analyzer.security_rules import IPsecSecurityAuditor
from analyzer.ai_engine import IPsecAIEngine
from analyzer.sample_generator import SAMPLE_SCENARIOS, generate_sample_pcap_file
from analyzer.config_auditor import IPsecConfigAuditor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")

# Path to the Vite production build output
# Check backend/dist first (Render deployment), then vite-project/dist (local dev)
_RENDER_DIST = Path(BASE_DIR) / "dist"
_LOCAL_DIST = Path(BASE_DIR).parent / "vite-project" / "dist"
FRONTEND_DIR = _RENDER_DIST if _RENDER_DIST.exists() else _LOCAL_DIST

os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="SecuraX IPsec VPN Protocol Analyzer API",
    description="Backend engine for AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework",
    version="1.0.0"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store + persistent history
ANALYSIS_STORE = {}

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(entry: dict):
    history = load_history()
    # Prepend new item
    history.insert(0, entry)
    # Keep last 50
    history = history[:50]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

# Load existing history into store at startup
for item in load_history():
    ANALYSIS_STORE[item["id"]] = item


class QuestionRequest(BaseModel):
    analysis_id: Optional[str] = None
    question: str

class ConfigAuditRequest(BaseModel):
    config_text: str


@app.get("/api/health")
def health_check():
    """Health check endpoint for Render deployment."""
    return {"status": "healthy", "service": "SecuraX", "version": "1.0.0"}


@app.get("/")
def root():
    """Serve the frontend SPA index.html at root, or show API status if not built."""
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {
        "status": "online",
        "service": "SecuraX IPsec VPN Protocol Analyzer Backend",
        "version": "1.0.0",
        "docs_url": "/docs",
        "note": "Frontend not built yet. Run 'npm run build' in vite-project/ first."
    }


@app.post("/api/upload")
async def upload_pcap(
    file: UploadFile = File(...),
    ike_version: str = Form("auto"),
    psk: str = Form("")
):
    """Upload and analyze a .pcap or .pcapng network capture file."""
    filename = file.filename
    if not (filename.endswith(".pcap") or filename.endswith(".pcapng")):
        raise HTTPException(status_code=400, detail="Only .pcap and .pcapng files are supported.")

    analysis_id = str(uuid.uuid4())[:8]
    save_path = os.path.join(UPLOADS_DIR, f"{analysis_id}_{filename}")

    try:
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # 1. Parse PCAP
    try:
        parser = IPsecPCAPParser(save_path, filter_ike_version=ike_version, psk=psk)
        pcap_results = parser.parse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parser error: {str(e)}")

    # 2. Run Security Audit
    auditor = IPsecSecurityAuditor(pcap_results, psk=psk)
    audit_results = auditor.evaluate()

    # 3. Generate AI Insights
    ai_engine = IPsecAIEngine(pcap_results, audit_results)
    ai_results = ai_engine.generate_ai_insights()

    # Aggregate full result object
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_result = {
        "id": analysis_id,
        "filename": filename,
        "timestamp": timestamp,
        "filesize": len(contents),
        "ike_version": ike_version,
        "psk_provided": bool(psk),
        "summary": pcap_results.get("summary", {}),
        "protocols": pcap_results.get("protocols", []),
        "ike_sessions": pcap_results.get("ike_sessions", []),
        "proposals": pcap_results.get("proposals", []),
        "esp_tunnels": pcap_results.get("esp_tunnels", []),
        "timeline": pcap_results.get("timeline", []),
        "unencrypted_leaks": pcap_results.get("unencrypted_leaks", []),
        "security": audit_results,
        "ai": ai_results
    }

    ANALYSIS_STORE[analysis_id] = full_result
    
    # Save lightweight history entry
    save_history({
        "id": analysis_id,
        "filename": filename,
        "timestamp": timestamp,
        "score": audit_results.get("score"),
        "grade": audit_results.get("grade"),
        "badge": audit_results.get("badge"),
        "total_packets": pcap_results.get("summary", {}).get("total_packets", 0),
        "ipsec_packets": pcap_results.get("summary", {}).get("ipsec_packets", 0),
        "critical_count": audit_results.get("critical_count", 0),
        "high_count": audit_results.get("high_count", 0)
    })

    return {
        "success": True,
        "analysis_id": analysis_id,
        "message": f"Successfully analyzed {filename}",
        "score": audit_results.get("score"),
        "grade": audit_results.get("grade"),
        "findings_count": audit_results.get("total_findings")
    }


@app.get("/api/analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    """Retrieve full analysis report by ID."""
    if analysis_id == "latest":
        if not ANALYSIS_STORE:
            # Fallback to vulnerable legacy sample if no analysis performed yet
            return get_sample_scenario("vulnerable_legacy")
        # Return most recent
        latest_id = list(ANALYSIS_STORE.keys())[-1]
        return ANALYSIS_STORE[latest_id]

    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
    return ANALYSIS_STORE[analysis_id]


@app.get("/api/sample/{scenario_key}")
def get_sample_scenario(scenario_key: str = "vulnerable_legacy"):
    """Load a pre-configured sample scenario for immediate demo and evaluation."""
    if scenario_key not in SAMPLE_SCENARIOS:
        scenario_key = "vulnerable_legacy"

    scenario = SAMPLE_SCENARIOS[scenario_key]
    auditor = IPsecSecurityAuditor(scenario, psk=scenario.get("sample_psk", ""))
    audit_results = auditor.evaluate()

    ai_engine = IPsecAIEngine(scenario, audit_results)
    ai_results = ai_engine.generate_ai_insights()

    sample_id = f"sample-{scenario_key}"
    full_result = {
        "id": sample_id,
        "filename": f"{scenario_key}.pcap (Preset Scenario)",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "filesize": 1420580,
        "ike_version": "auto",
        "psk_provided": bool(scenario.get("sample_psk")),
        "summary": scenario.get("summary", {}),
        "protocols": scenario.get("protocols", []),
        "ike_sessions": scenario.get("ike_sessions", []),
        "proposals": scenario.get("proposals", []),
        "esp_tunnels": scenario.get("esp_tunnels", []),
        "timeline": scenario.get("timeline", []),
        "unencrypted_leaks": scenario.get("unencrypted_leaks", []),
        "security": audit_results,
        "ai": ai_results
    }
    ANALYSIS_STORE[sample_id] = full_result
    return full_result


@app.post("/api/ai/ask")
def ask_ai(req: QuestionRequest):
    """Ask an interactive question about the IPsec analysis."""
    # Find relevant analysis
    analysis_id = req.analysis_id or "latest"
    if analysis_id == "latest":
        data = get_analysis("latest")
    elif analysis_id in ANALYSIS_STORE:
        data = ANALYSIS_STORE[analysis_id]
    else:
        data = get_sample_scenario("vulnerable_legacy")

    pcap_data = {
        "summary": data.get("summary"),
        "proposals": data.get("proposals"),
        "ike_sessions": data.get("ike_sessions")
    }
    audit_data = data.get("security", {})
    ai_engine = IPsecAIEngine(pcap_data, audit_data)
    response_text = ai_engine.ask(req.question)

    return {
        "question": req.question,
        "answer": response_text
    }


@app.post("/api/config-audit")
def audit_config(req: ConfigAuditRequest):
    """Statically audit raw Cisco IOS, strongSwan, or PfSense IPsec configuration text."""
    if not req.config_text.strip():
        raise HTTPException(status_code=400, detail="Config text cannot be empty.")

    auditor = IPsecConfigAuditor(req.config_text)
    res = auditor.parse_and_audit()

    ai_engine = IPsecAIEngine(res["pcap_data"], res["audit_data"])
    ai_res = ai_engine.generate_ai_insights()

    audit_id = f"cfg-{str(uuid.uuid4())[:6]}"
    full_result = {
        "id": audit_id,
        "filename": "Static Configuration Audit",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "filesize": len(req.config_text),
        "ike_version": "auto",
        "psk_provided": True,
        "summary": res["pcap_data"]["summary"],
        "protocols": res["pcap_data"]["protocols"],
        "ike_sessions": res["pcap_data"]["ike_sessions"],
        "proposals": res["pcap_data"]["proposals"],
        "esp_tunnels": [],
        "timeline": [],
        "unencrypted_leaks": [],
        "security": res["audit_data"],
        "ai": ai_res
    }
    ANALYSIS_STORE[audit_id] = full_result
    return full_result


@app.get("/api/history")
def get_history():
    """Retrieve history of past analyses."""
    return load_history()


@app.get("/api/export/{analysis_id}/html")
def export_report_html(analysis_id: str):
    """Generate a clean, printable HTML Executive Security Audit Report."""
    data = get_analysis(analysis_id)
    security = data.get("security", {})
    summary = data.get("summary", {})
    ai = data.get("ai", {})

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SecuraX Security Audit Report - {data.get('filename')}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }}
        .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }}
        .score-box {{ background: #0f172a; color: white; padding: 15px 25px; border-radius: 12px; text-align: center; }}
        .score-val {{ font-size: 36px; font-weight: bold; color: {'#10b981' if security.get('score', 0) >= 80 else '#f59e0b' if security.get('score', 0) >= 60 else '#ef4444'}; }}
        .section {{ background: white; padding: 25px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 25px; }}
        h2 {{ color: #0f172a; margin-top: 0; }}
        .finding {{ border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 14px; background: #fef2f2; border-radius: 0 8px 8px 0; }}
        .finding-high {{ border-left-color: #f97316; background: #fff7ed; }}
        .finding-med {{ border-left-color: #f59e0b; background: #fefce8; }}
        .badge {{ display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }}
        .badge-crit {{ background: #ef4444; color: white; }}
        .badge-high {{ background: #f97316; color: white; }}
        .badge-med {{ background: #f59e0b; color: white; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        th, td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
        th {{ background: #f1f5f9; }}
        pre {{ background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>SecuraX IPsec Security Audit Report</h1>
            <p><strong>Target Capture / Config:</strong> {data.get('filename')} | <strong>Generated:</strong> {data.get('timestamp')}</p>
        </div>
        <div class="score-box">
            <div>SECURITY SCORE</div>
            <div class="score-val">{security.get('score', 100)}/100</div>
            <div>{security.get('badge', 'Reviewed')}</div>
        </div>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>{ai.get('executive_summary', 'Analysis completed successfully.')}</p>
        <table>
            <tr><th>Total Packets</th><td>{summary.get('total_packets', 0):,}</td><th>IPsec Packets</th><td>{summary.get('ipsec_packets', 0):,} ({summary.get('ipsec_percentage', 0)}%)</td></tr>
            <tr><th>Encrypted Packets</th><td>{summary.get('encrypted_packets', 0):,}</td><th>Avg Payload Entropy</th><td>{summary.get('avg_entropy', 0)} bits/byte</td></tr>
            <tr><th>IKE Packets</th><td>{summary.get('ike_packets', 0):,}</td><th>ESP Tunnels</th><td>{summary.get('tunnel_count', 0)}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Identified Security Vulnerabilities ({security.get('total_findings', 0)})</h2>
        {''.join([f'''
        <div class="finding {'finding-high' if f.get('level') == 'high' else 'finding-med' if f.get('level') == 'medium' else ''}">
            <div style="display: flex; justify-content: space-between;">
                <strong>{f.get('title')}</strong>
                <span class="badge badge-{'crit' if f.get('level') == 'critical' else 'high' if f.get('level') == 'high' else 'med'}">{f.get('level')} (CVSS {f.get('cvss')})</span>
            </div>
            <p style="margin: 6px 0; font-size: 14px;">{f.get('description')}</p>
            <div style="font-size: 13px; color: #475569;"><strong>Remediation:</strong> {f.get('remediation')}</div>
        </div>
        ''' for f in security.get('findings', [])])}
    </div>

    <div class="section">
        <h2>Regulatory Compliance Checklist</h2>
        <table>
            <tr><th>Framework / Standard</th><th>Status</th><th>Verification Details</th></tr>
            {''.join([f'''
            <tr>
                <td><strong>{c.get('standard')}</strong></td>
                <td><strong style="color: {'#10b981' if c.get('status') in ('PASS', 'COMPLIANT') else '#ef4444'}">{c.get('status')}</strong></td>
                <td>{c.get('details')}</td>
            </tr>
            ''' for c in security.get('compliance', [])])}
        </table>
    </div>

    <div class="section">
        <h2>Remediation Configuration (strongSwan / Cisco)</h2>
        <pre>{ai.get('remediation_configs', {}).get('strongswan', '# Configuration template')}</pre>
    </div>
</body>
</html>
"""
    return HTMLResponse(content=html_content)


@app.get("/api/download/sample-pcap")
def download_sample_pcap(scenario: str = "vulnerable_legacy"):
    """Generates and returns an actual binary .pcap file on disk."""
    sample_path = os.path.join(UPLOADS_DIR, f"sample_{scenario}.pcap")
    generate_sample_pcap_file(sample_path, scenario)
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=500, detail="Failed to generate sample PCAP.")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        sample_path,
        media_type="application/vnd.tcpdump.pcap",
        filename=f"securax_{scenario}.pcap"
    )


# --- Mount frontend static assets (JS, CSS, images) ---
if FRONTEND_DIR.exists() and (FRONTEND_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="frontend-assets")

# SPA catch-all: any route not matched by /api/* serves index.html
# This allows React Router to handle client-side navigation
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    """Catch-all route for SPA navigation. Serves frontend or 404."""
    # Try to serve static files from dist/ first
    file_path = FRONTEND_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    # Fallback to index.html for SPA routing
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse({"detail": "Frontend not built. Run 'npm run build' in vite-project/"}, status_code=404)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
