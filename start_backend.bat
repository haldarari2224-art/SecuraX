@echo off
echo ========================================================
echo Starting SecuraX IPsec VPN Protocol Analyzer Backend API
echo Server: http://localhost:8000
echo Swagger Docs: http://localhost:8000/docs
echo ========================================================
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pause
