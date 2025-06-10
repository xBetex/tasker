import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando teardown global dos testes...');
  
  // Cleanup de arquivos temporários se necessário
  if (process.env.CLEANUP_TEMP_FILES) {
    console.log('🗑️ Limpando arquivos temporários...');
    // Adicionar lógica de limpeza aqui se necessário
  }
  
  // Log de estatísticas finais
  console.log('📊 Testes concluídos!');
  console.log('✅ Teardown global concluído!');
}

export default globalTeardown; 