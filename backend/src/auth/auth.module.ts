import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
