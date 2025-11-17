import { api } from './api/main';
import { workers } from './workers/main';

const mode = process.env.NODE_MODE;

async function bootstrap() {
  try {
    if (mode === 'api-only') {
      console.log('🚀 Starting Rugido Digital API only...');
      await api();
    } else if (mode === 'workers-only') {
      console.log('⚙️ Starting Rugido Digital Workers only...');
      await workers();
    } else {
      console.log('🚀 Starting Rugido Digital Backend (API + Workers)...');
      await Promise.all([
        api(),
        workers()
      ]);
      console.log('✅ Rugido Digital Backend running successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to start Rugido Digital Backend:', error);
    process.exit(1);
  }
}

bootstrap();