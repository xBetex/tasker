@echo off
echo Starting Task Dashboard Application...

REM Get current directory
set ROOT_DIR=%cd%

REM Create backend startup script
echo @echo off > "%TEMP%\start-backend.bat"
echo echo Starting Backend Server... >> "%TEMP%\start-backend.bat"
echo cd /d "%ROOT_DIR%\backend" >> "%TEMP%\start-backend.bat"
echo if not exist venv ( >> "%TEMP%\start-backend.bat"
echo     echo Creating virtual environment... >> "%TEMP%\start-backend.bat"
echo     python -m venv venv >> "%TEMP%\start-backend.bat"
echo ) >> "%TEMP%\start-backend.bat"
echo echo Activating virtual environment... >> "%TEMP%\start-backend.bat"
echo call venv\Scripts\activate.bat >> "%TEMP%\start-backend.bat"
echo echo Installing/Updating requirements... >> "%TEMP%\start-backend.bat"
echo pip install -r requirements.txt >> "%TEMP%\start-backend.bat"
echo echo Starting FastAPI server on http://localhost:8000 >> "%TEMP%\start-backend.bat"
echo echo Press Ctrl+C to stop the backend server >> "%TEMP%\start-backend.bat"
echo python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 >> "%TEMP%\start-backend.bat"
echo if errorlevel 1 ( >> "%TEMP%\start-backend.bat"
echo     echo Backend server stopped with error. Press any key to close... >> "%TEMP%\start-backend.bat"
echo     pause >> "%TEMP%\start-backend.bat"
echo ) >> "%TEMP%\start-backend.bat"

REM Create frontend startup script
echo @echo off > "%TEMP%\start-frontend.bat"
echo echo Starting Frontend Server... >> "%TEMP%\start-frontend.bat"
echo cd /d "%ROOT_DIR%" >> "%TEMP%\start-frontend.bat"
echo if not exist node_modules ( >> "%TEMP%\start-frontend.bat"
echo     echo Installing npm dependencies... >> "%TEMP%\start-frontend.bat"
echo     npm install >> "%TEMP%\start-frontend.bat"
echo ) >> "%TEMP%\start-frontend.bat"
echo echo Starting Next.js development server on http://localhost:3000 >> "%TEMP%\start-frontend.bat"
echo echo Press Ctrl+C to stop the frontend server >> "%TEMP%\start-frontend.bat"
echo npm run dev >> "%TEMP%\start-frontend.bat"
echo if errorlevel 1 ( >> "%TEMP%\start-frontend.bat"
echo     echo Frontend server stopped with error. Press any key to close... >> "%TEMP%\start-frontend.bat"
echo     pause >> "%TEMP%\start-frontend.bat"
echo ) >> "%TEMP%\start-frontend.bat"

echo.
echo Starting Backend Server in new window...
start "Backend Server" cmd /k "%TEMP%\start-backend.bat"

echo.
echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server in new window...
start "Frontend Server" cmd /k "%TEMP%\start-frontend.bat"

echo.
echo Both services are starting in separate windows!
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo To stop services, close the respective command prompt windows.
echo.
echo Press any key to continue...
pause >nul

REM Clean up temporary files
del "%TEMP%\start-backend.bat" 2>nul
del "%TEMP%\start-frontend.bat" 2>nul 