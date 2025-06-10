@echo off
setlocal enabledelayedexpansion

REM Script para executar testes no Docker (Windows)
REM Uso: run-tests-docker.bat [unit|e2e|all]

set "TEST_TYPE=%~1"
if "%TEST_TYPE%"=="" set "TEST_TYPE=all"

echo.
echo [%date% %time%] Iniciando testes Docker - Tipo: %TEST_TYPE%
echo.

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker nao esta rodando. Por favor, inicie o Docker e tente novamente.
    exit /b 1
)

REM Função de limpeza
:cleanup
echo [%date% %time%] Fazendo limpeza...
docker-compose -f docker-compose.test.yml down --volumes --remove-orphans >nul 2>&1
goto :eof

REM Verificar tipo de teste
if "%TEST_TYPE%"=="unit" goto unit_tests
if "%TEST_TYPE%"=="e2e" goto e2e_tests
if "%TEST_TYPE%"=="all" goto all_tests

echo ❌ Tipo de teste invalido: %TEST_TYPE%
echo Uso: %0 [unit^|e2e^|all]
exit /b 1

:unit_tests
echo [%date% %time%] 🧪 Executando testes unitarios no Docker...
docker-compose -f docker-compose.test.yml run --rm test-unit
if errorlevel 1 (
    echo ❌ Testes unitarios falharam!
    call :cleanup
    exit /b 1
) else (
    echo ✅ Testes unitarios passaram!
)
goto end

:e2e_tests
echo [%date% %time%] 🎭 Executando testes E2E no Docker...
echo [%date% %time%] Iniciando aplicacao para testes E2E...
docker-compose -f docker-compose.test.yml up -d app-test backend-test

echo [%date% %time%] ⏳ Aguardando aplicacao estar pronta...
timeout /t 30 /nobreak >nul

echo [%date% %time%] Executando testes E2E...
docker-compose -f docker-compose.test.yml run --rm test-e2e
if errorlevel 1 (
    echo ❌ Testes E2E falharam!
    call :cleanup
    exit /b 1
) else (
    echo ✅ Testes E2E passaram!
)
goto end

:all_tests
echo [%date% %time%] 🚀 Executando todos os testes no Docker...

echo [%date% %time%] 1️⃣ Executando testes unitarios...
docker-compose -f docker-compose.test.yml run --rm test-unit
set "UNIT_EXIT_CODE=!errorlevel!"

if !UNIT_EXIT_CODE! equ 0 (
    echo ✅ Testes unitarios passaram!
) else (
    echo ❌ Testes unitarios falharam!
)

echo [%date% %time%] 2️⃣ Executando testes E2E...
echo [%date% %time%] Iniciando aplicacao para testes E2E...
docker-compose -f docker-compose.test.yml up -d app-test backend-test

echo [%date% %time%] ⏳ Aguardando aplicacao estar pronta...
timeout /t 30 /nobreak >nul

echo [%date% %time%] Executando testes E2E...
docker-compose -f docker-compose.test.yml run --rm test-e2e
set "E2E_EXIT_CODE=!errorlevel!"

if !E2E_EXIT_CODE! equ 0 (
    echo ✅ Testes E2E passaram!
) else (
    echo ❌ Testes E2E falharam!
)

REM Relatorio final
echo.
echo [%date% %time%] 📊 Resumo dos testes:
if !UNIT_EXIT_CODE! equ 0 (
    echo ✅ Testes Unitarios: PASSOU
) else (
    echo ❌ Testes Unitarios: FALHOU
)

if !E2E_EXIT_CODE! equ 0 (
    echo ✅ Testes E2E: PASSOU
) else (
    echo ❌ Testes E2E: FALHOU
)

if !UNIT_EXIT_CODE! neq 0 (
    echo ❌ Alguns testes falharam!
    call :cleanup
    exit /b 1
) else if !E2E_EXIT_CODE! neq 0 (
    echo ❌ Alguns testes falharam!
    call :cleanup
    exit /b 1
) else (
    echo ✅ Todos os testes passaram! 🎉
)

:end
call :cleanup
echo [%date% %time%] 🏁 Testes concluidos!
echo. 