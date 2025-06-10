# Plano de Testes - Task Dashboard

## Visão Geral

Este documento descreve a estratégia de testes para o Task Dashboard, incluindo testes unitários, de integração e end-to-end.

## Estrutura de Testes

### 1. Testes Unitários (Jest + React Testing Library)

#### Componentes Principais
- **ClientCard.test.tsx** - Testa renderização, interações e estados do card de cliente
- **FilterBar.test.tsx** - Testa filtros de busca, status, prioridade e data
- **AddClientModal.test.tsx** - Testa criação e validação de novos clientes
- **ClientDetailModal.test.tsx** - Testa visualização e edição de detalhes do cliente
- **NotificationToast.test.tsx** - Testa sistema de notificações

#### Utilitários
- **dateUtils.test.ts** - Testa formatação e validação de datas
- **slaUtils.test.ts** - Testa cálculos de SLA e alertas
- **filterUtils.test.ts** - Testa lógica de filtros

#### Hooks Personalizados
- **useClients.test.ts** - Testa gerenciamento de estado dos clientes
- **useToast.test.ts** - Testa sistema de notificações
- **useDragDrop.test.ts** - Testa funcionalidade de drag and drop

### 2. Testes de Integração

#### API Integration
- **api.test.ts** - Testa todas as operações CRUD com a API
- **clientOperations.test.ts** - Testa fluxos completos de cliente
- **taskOperations.test.ts** - Testa operações de tarefas

#### Context Integration
- **DragDropContext.test.ts** - Testa contexto de drag and drop
- **NotificationContext.test.ts** - Testa contexto de notificações

### 3. Testes End-to-End (Playwright)

#### Funcionalidades Principais
- **dashboard.spec.ts** - Testa navegação e funcionalidades principais
- **client-management.spec.ts** - Testa CRUD completo de clientes
- **task-management.spec.ts** - Testa operações de tarefas
- **filtering.spec.ts** - Testa todos os filtros em conjunto

## Cenários de Teste

### Funcionalidades Core

#### 1. Gerenciamento de Clientes
- ✅ Listar todos os clientes
- ✅ Criar novo cliente
- ✅ Editar cliente existente
- ✅ Deletar cliente
- ✅ Buscar clientes por nome/empresa
- ✅ Filtrar clientes por status

#### 2. Gerenciamento de Tarefas
- ✅ Adicionar tarefa a um cliente
- ✅ Editar tarefa existente
- ✅ Alterar status da tarefa
- ✅ Deletar tarefa
- ✅ Adicionar comentários
- ✅ Filtrar tarefas por prioridade

#### 3. Interface do Usuário
- ✅ Expandir/colapsar cards de cliente
- ✅ Alternância entre modo claro/escuro
- ✅ Toggle entre Grid/Infinity Pool
- ✅ Responsividade mobile
- ✅ Navegação por teclado

#### 4. Funcionalidades Avançadas
- ✅ Drag and drop (apenas Infinity Pool)
- ✅ Pin/unpin clientes
- ✅ Notificações toast
- ✅ Exportar/importar JSON
- ✅ SLA tracking

### Casos de Teste Específicos

#### Filtros
1. **Busca por texto**
   - Buscar por nome do cliente
   - Buscar por empresa
   - Buscar por descrição de tarefa
   - Limpar busca

2. **Filtros de status**
   - Filtrar por "pending"
   - Filtrar por "in progress"
   - Filtrar por "completed"
   - Filtrar por "awaiting client"
   - Mostrar todos

3. **Filtros de prioridade**
   - Filtrar por alta prioridade
   - Filtrar por média prioridade
   - Filtrar por baixa prioridade

4. **Filtros de data**
   - Filtrar por período específico
   - Filtrar tarefas vencidas
   - Filtrar por SLA

#### Performance
1. **Infinity Pool**
   - Renderização de muitos clientes (1000+)
   - Scroll suave
   - Virtualização funcionando

2. **Drag & Drop**
   - Arrastar entre posições
   - Performance com muitos items
   - Estados visuais corretos

#### Estados de Erro
1. **Conexão API**
   - Falha na conexão
   - Timeout de requisição
   - Dados inválidos

2. **Validação**
   - Campos obrigatórios
   - Formatos de data
   - Limites de caracteres

## Configuração e Execução

### Instalação de Dependências

```bash
npm install --save-dev \
  @testing-library/jest-dom \
  @testing-library/react \
  @testing-library/user-event \
  @types/jest \
  jest \
  jest-environment-jsdom \
  @playwright/test
```

### Scripts de Teste

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui
```

### Configuração do Ambiente

#### Jest (jest.config.js)
- Configurado para Next.js
- Mocks para localStorage, fetch, etc.
- Cobertura configurada

#### Playwright (playwright.config.ts)
- Múltiplos browsers
- Testes mobile
- Screenshots e vídeos em falhas

## Métricas de Qualidade

### Cobertura de Código
- **Objetivo**: 80%+ de cobertura
- **Componentes críticos**: 90%+
- **Utilitários**: 95%+

### Performance
- **Tempo de carregamento**: < 3s
- **Infinity Pool**: > 60 FPS
- **Drag & Drop**: < 100ms latência

### Acessibilidade
- **Navegação por teclado**: 100%
- **Screen readers**: Compatível
- **Contraste**: WCAG AA

## Testes de Regressão

### Checklist Pré-Deploy
- [ ] Todos os testes unitários passando
- [ ] Testes E2E executados com sucesso
- [ ] Cobertura de código aceitável
- [ ] Performance dentro dos limites
- [ ] Teste manual em produção

### Cenários Críticos
1. **Fluxo completo de cliente**
   - Criar → Editar → Adicionar tarefas → Deletar

2. **Filtros combinados**
   - Múltiplos filtros aplicados simultaneamente

3. **Performance com dados reais**
   - Teste com volume real de dados

## Automação CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:e2e
```

### Pre-commit Hooks
- Executar testes unitários
- Linting
- Type checking

## Monitoramento

### Métricas de Teste
- Taxa de sucesso dos testes
- Tempo de execução
- Cobertura de código

### Alertas
- Falhas em testes críticos
- Queda na cobertura
- Performance degradada

---

## Executando os Testes

### Pré-requisitos
1. Node.js 18+
2. Dependências instaladas: `npm install`
3. Backend rodando (para testes E2E)

### Comandos Principais

#### Execução Local
```bash
# Instalar dependências de teste
npm install

# Executar todos os testes unitários
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar testes E2E
npm run test:e2e

# Executar testes E2E com interface visual
npm run test:e2e:ui
```

#### Execução com Docker

##### Windows
```batch
# Executar todos os testes
run-tests-docker.bat

# Executar apenas testes unitários
run-tests-docker.bat unit

# Executar apenas testes E2E
run-tests-docker.bat e2e
```

##### Linux/Mac
```bash
# Tornar script executável
chmod +x run-tests-docker.sh

# Executar todos os testes
./run-tests-docker.sh

# Executar apenas testes unitários
./run-tests-docker.sh unit

# Executar apenas testes E2E
./run-tests-docker.sh e2e
```

##### Docker Compose Direto
```bash
# Testes unitários
npm run test:docker:unit

# Testes E2E
npm run test:docker:e2e

# Todos os testes
npm run test:docker
```

### Estrutura dos Resultados

```
test-results/
├── coverage/          # Relatórios de cobertura
├── playwright-report/ # Relatórios E2E
├── screenshots/       # Screenshots de falhas
└── videos/           # Vídeos de execução
```

Este plano garante que todas as funcionalidades críticas sejam testadas de forma abrangente e automatizada. 