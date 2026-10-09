import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { ResponsesModule } from './responses/responses.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AppConfigModule, ResponsesModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
