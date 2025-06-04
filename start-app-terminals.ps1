# PowerShell script to start backend and frontend in separate terminal windows
Write-Host "Starting Task Dashboard Application in separate terminals..." -ForegroundColor Green

# Get the current directory
$rootDir = Get-Location

# Backend startup script content
$backendScript = @"
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Set-Location "$rootDir\backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install requirements if needed
Write-Host "Installing/Updating requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start the FastAPI server
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the backend server" -ForegroundColor Yellow
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend server stopped with error. Press any key to close..." -ForegroundColor Red
    Read-Host
}
"@

# Frontend startup script content
$frontendScript = @"
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Set-Location "$rootDir"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the Next.js development server
Write-Host "Starting Next.js development server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
npm run dev

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend server stopped with error. Press any key to close..." -ForegroundColor Red
    Read-Host
}
"@

# Create temporary script files
$backendScriptPath = Join-Path $env:TEMP "start-backend.ps1"
$frontendScriptPath = Join-Path $env:TEMP "start-frontend.ps1"

$backendScript | Out-File -FilePath $backendScriptPath -Encoding UTF8
$frontendScript | Out-File -FilePath $frontendScriptPath -Encoding UTF8

# Start backend in new terminal
Write-Host "Opening backend terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScriptPath

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start frontend in new terminal
Write-Host "Opening frontend terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $frontendScriptPath

Write-Host "`nBoth services are starting in separate terminal windows!" -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nTo stop services, close the respective terminal windows or press Ctrl+C in each." -ForegroundColor Yellow

# Clean up temporary files after a delay
Start-Sleep -Seconds 5
Remove-Item $backendScriptPath -ErrorAction SilentlyContinue
Remove-Item $frontendScriptPath -ErrorAction SilentlyContinue 