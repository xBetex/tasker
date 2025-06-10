#!/bin/bash

# Script para executar testes no Docker
# Uso: ./run-tests-docker.sh [unit|e2e|all]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Função para limpeza
cleanup() {
    log "Fazendo limpeza..."
    docker-compose -f docker-compose.test.yml down --volumes --remove-orphans 2>/dev/null || true
}

# Trap para limpeza em caso de interrupção
trap cleanup EXIT

# Determinar tipo de teste
TEST_TYPE=${1:-all}

case $TEST_TYPE in
    "unit")
        log "🧪 Executando testes unitários no Docker..."
        docker-compose -f docker-compose.test.yml run --rm test-unit
        if [ $? -eq 0 ]; then
            success "Testes unitários passaram!"
        else
            error "Testes unitários falharam!"
            exit 1
        fi
        ;;
    
    "e2e")
        log "🎭 Executando testes E2E no Docker..."
        # Iniciar aplicação para testes E2E
        docker-compose -f docker-compose.test.yml up -d app-test backend-test
        
        # Aguardar aplicação estar pronta
        log "⏳ Aguardando aplicação estar pronta..."
        sleep 30
        
        # Executar testes E2E
        docker-compose -f docker-compose.test.yml run --rm test-e2e
        if [ $? -eq 0 ]; then
            success "Testes E2E passaram!"
        else
            error "Testes E2E falharam!"
            exit 1
        fi
        ;;
    
    "all")
        log "🚀 Executando todos os testes no Docker..."
        
        # Primeiro executar testes unitários
        log "1️⃣ Executando testes unitários..."
        docker-compose -f docker-compose.test.yml run --rm test-unit
        UNIT_EXIT_CODE=$?
        
        if [ $UNIT_EXIT_CODE -eq 0 ]; then
            success "Testes unitários passaram!"
        else
            error "Testes unitários falharam!"
        fi
        
        # Depois executar testes E2E
        log "2️⃣ Executando testes E2E..."
        docker-compose -f docker-compose.test.yml up -d app-test backend-test
        
        # Aguardar aplicação estar pronta
        log "⏳ Aguardando aplicação estar pronta..."
        sleep 30
        
        docker-compose -f docker-compose.test.yml run --rm test-e2e
        E2E_EXIT_CODE=$?
        
        if [ $E2E_EXIT_CODE -eq 0 ]; then
            success "Testes E2E passaram!"
        else
            error "Testes E2E falharam!"
        fi
        
        # Relatório final
        echo ""
        log "📊 Resumo dos testes:"
        if [ $UNIT_EXIT_CODE -eq 0 ]; then
            success "Testes Unitários: PASSOU"
        else
            error "Testes Unitários: FALHOU"
        fi
        
        if [ $E2E_EXIT_CODE -eq 0 ]; then
            success "Testes E2E: PASSOU"
        else
            error "Testes E2E: FALHOU"
        fi
        
        if [ $UNIT_EXIT_CODE -ne 0 ] || [ $E2E_EXIT_CODE -ne 0 ]; then
            error "Alguns testes falharam!"
            exit 1
        else
            success "Todos os testes passaram! 🎉"
        fi
        ;;
    
    *)
        error "Tipo de teste inválido: $TEST_TYPE"
        echo "Uso: $0 [unit|e2e|all]"
        exit 1
        ;;
esac

log "🏁 Testes concluídos!" 