import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body('password') password: string) {
    return this.authService.login(password);
  }
}
