import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  login(password: string) {
    const isValid = this.configService.validateAdminPassword(password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid admin password');
    }
    return {
      success: true,
      token: 'admin-token-' + Date.now(),
      message: 'Admin authenticated successfully',
    };
  }
}
