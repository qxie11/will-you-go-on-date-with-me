import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ConfigService, AppConfig } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('profiles')
  getProfiles() {
    return this.configService.getProfiles();
  }

  @Get()
  getConfig(@Query('id') id: string = 'default', @Query('lang') lang: string = 'ru') {
    return this.configService.getConfig(false, id, lang);
  }

  @Post()
  updateConfig(@Query('id') id: string = 'default', @Query('lang') lang: string = 'ru', @Body() body: Partial<AppConfig>) {
    const updated = this.configService.updateConfig(body, id, lang);
    return {
      success: true,
      message: 'Configuration successfully updated',
      data: updated,
    };
  }
}
