import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

export async function workers() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  console.log('Rugido Digital Workers started');

  process.on('SIGINT', async () => {
    console.log('Shutting down workers...');
    await app.close();
    process.exit(0);
  });
}