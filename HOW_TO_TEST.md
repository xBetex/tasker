# Como Usar os Testes - Guia Prático

## 🚀 Início Rápido

### 1. Testar se tudo está funcionando
```bash
# Teste básico para validar infraestrutura
npm test src/__tests__/demo.test.ts
```

### 2. Executar todos os testes unitários
```bash
# Todos os testes (incluindo alguns que podem falhar temporariamente)
npm test

# Apenas testes que passam atualmente
npm test -- --passWithNoTests
```

### 3. Desenvolvimento com hot reload
```bash
# Executar em modo watch para desenvolvimento
npm run test:watch
```

## 🐳 Testes com Docker

### Windows
```batch
# Executar todos os testes no Docker
run-tests-docker.bat

# Apenas testes unitários
run-tests-docker.bat unit

# Apenas testes E2E
run-tests-docker.bat e2e
```

### Linux/Mac
```bash
# Tornar script executável
chmod +x run-tests-docker.sh

# Executar todos os testes
./run-tests-docker.sh

# Específicos
./run-tests-docker.sh unit
./run-tests-docker.sh e2e
```

## 📊 Cobertura de Código

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Abrir relatório no navegador
# Windows: start coverage/lcov-report/index.html
# Mac: open coverage/lcov-report/index.html
# Linux: xdg-open coverage/lcov-report/index.html
```

## 🎭 Testes End-to-End

```bash
# Iniciar aplicação em modo de desenvolvimento
npm run dev

# Em outro terminal, executar testes E2E
npm run test:e2e

# Com interface visual (útil para debug)
npm run test:e2e:ui
```

## 🛠️ Criando Novos Testes

### Teste Unitário Simples
```typescript
// src/__tests__/utils/myUtil.test.ts
import { myFunction } from '@/utils/myUtil'

describe('MyUtil', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Teste de Componente React
```typescript
// src/__tests__/components/MyComponent.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@/utils/test-utils'
import MyComponent from '@/app/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<MyComponent onClick={onClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Teste E2E
```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test('my feature works', async ({ page }) => {
  await page.goto('/')
  await page.click('button[data-testid="my-button"]')
  await expect(page.locator('.result')).toBeVisible()
})
```

## 🔍 Debug de Testes

### Jest Debug
```bash
# Executar testes em modo debug
npm test -- --runInBand --detectOpenHandles

# Executar teste específico
npm test MyComponent.test.tsx

# Com mais detalhes
npm test -- --verbose
```

### Playwright Debug
```bash
# Debug mode com browser visível
npm run test:e2e -- --debug

# Headed mode (ver browser)
npm run test:e2e -- --headed

# Pause em falhas
npm run test:e2e -- --pause-on-failure
```

## 📁 Estrutura de Arquivos

```
src/
├── __tests__/
│   ├── components/          # Testes de componentes
│   ├── utils/              # Testes de utilitários
│   ├── integration/        # Testes de integração
│   └── demo.test.ts        # Teste de demonstração
├── utils/
│   └── test-utils.tsx      # Utilitários para testes
tests/
├── e2e/                    # Testes End-to-End
├── global-setup.ts         # Setup global Playwright
└── global-teardown.ts      # Teardown global
```

## 🎯 Boas Práticas

### 1. Nomenclatura
- Arquivos: `Component.test.tsx` ou `util.test.ts`
- Testes E2E: `feature.spec.ts`
- Descrições claras: `should handle user clicking submit button`

### 2. Organização
- Um arquivo de teste por componente/utilitário
- Agrupar testes relacionados com `describe()`
- Usar `beforeEach()` para setup comum

### 3. Mocks
```typescript
// Mock de API
jest.mock('@/services/api', () => ({
  api: {
    getClients: jest.fn(() => Promise.resolve(mockClients)),
    createClient: jest.fn(),
  }
}))

// Mock de hook
jest.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    clients: mockClients,
    loading: false,
    error: null,
  })
}))
```

### 4. Seletores Confiáveis
```typescript
// ✅ Bom - data-testid
screen.getByTestId('submit-button')

// ✅ Bom - role
screen.getByRole('button', { name: /submit/i })

// ⚠️ Cuidado - texto pode mudar
screen.getByText('Submit')

// ❌ Evitar - classes CSS podem mudar
document.querySelector('.btn-primary')
```

## 🚨 Troubleshooting

### Problema: Testes falhando com timeout
```bash
# Aumentar timeout
npm test -- --testTimeout=30000
```

### Problema: Mock não funcionando
```typescript
// Limpar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Problema: Docker não executa
```bash
# Verificar se Docker está rodando
docker info

# Verificar logs
docker-compose -f docker-compose.test.yml logs test-unit
```

### Problema: E2E falhando no CI
```typescript
// Adicionar waits apropriados
await page.waitForLoadState('networkidle')
await page.waitForSelector('[data-testid="content"]')
```

## 📈 Métricas de Qualidade

### Cobertura Mínima
- **Utilitários**: 95%+
- **Componentes**: 80%+
- **Integração**: 70%+

### Performance
- **Testes unitários**: < 10s total
- **Testes E2E**: < 2min total
- **Timeout por teste**: 30s máximo

## 🔄 CI/CD Integration

### GitHub Actions Exemplo
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

Pronto! Agora você tem um sistema de testes completo e robusto. 🎉 