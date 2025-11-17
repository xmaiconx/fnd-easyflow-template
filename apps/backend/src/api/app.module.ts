import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { SharedModule } from '../shared/shared.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AuthModule,
    WorkspaceModule,
    WebhooksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}