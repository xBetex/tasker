# PowerShell script to start both backend and frontend
Write-Host "Starting Task Dashboard Application..." -ForegroundColor Green

# Get the current directory
$rootDir = Get-Location

# Function to start backend
function Start-Backend {
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
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Set-Location $rootDir
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start the Next.js development server
    Write-Host "Starting Next.js development server on http://localhost:3000" -ForegroundColor Green
    npm run dev
}

# Start both services in parallel using PowerShell jobs
Write-Host "Starting services in parallel..." -ForegroundColor Cyan

# Start backend in a background job
$backendJob = Start-Job -ScriptBlock ${function:Start-Backend}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a background job
$frontendJob = Start-Job -ScriptBlock ${function:Start-Frontend}

# Display job information
Write-Host "Backend Job ID: $($backendJob.Id)" -ForegroundColor Magenta
Write-Host "Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Magenta

Write-Host "`nServices starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow

# Monitor jobs and display output
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "One or more services failed to start!" -ForegroundColor Red
            break
        }
        
        # Receive and display job output
        Receive-Job -Job $backendJob -OutVariable backendOutput -ErrorVariable backendError
        Receive-Job -Job $frontendJob -OutVariable frontendOutput -ErrorVariable frontendError
        
        if ($backendOutput) { 
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue 
        }
        if ($frontendOutput) { 
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Green 
        }
        if ($backendError) { 
            Write-Host "[BACKEND ERROR] $backendError" -ForegroundColor Red 
        }
        if ($frontendError) { 
            Write-Host "[FRONTEND ERROR] $frontendError" -ForegroundColor Red 
        }
        
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "Stopping services..." -ForegroundColor Yellow
}
finally {
    # Clean up jobs
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Red
} 