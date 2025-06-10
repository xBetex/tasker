import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes...');
  
  // Pre-warm browsers se não estivermos no CI
  if (!process.env.CI) {
    console.log('🌐 Pre-aquecendo browsers...');
    const browser = await chromium.launch();
    await browser.close();
  }
  
  // Configurar timeout global maior para testes mais estáveis
  if (process.env.DOCKER) {
    console.log('🐳 Configuração Docker detectada, ajustando timeouts...');
  }
  
  console.log('✅ Setup global concluído!');
}

export default globalSetup; 