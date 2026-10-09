import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ResponsesService, DateResponse } from './responses.service';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Get()
  getAll() {
    return this.responsesService.getAll();
  }

  @Get('stats')
  getStats() {
    return this.responsesService.getStats();
  }

  @Post()
  create(@Body() body: Partial<DateResponse>) {
    const created = this.responsesService.create(body);
    return {
      success: true,
      message: 'Date response submitted successfully!',
      data: created,
    };
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const updated = this.responsesService.updateStatus(id, status);
    return {
      success: true,
      data: updated,
    };
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.responsesService.delete(id);
    return {
      success: true,
      message: 'Response deleted',
    };
  }

  @Delete()
  clearAll() {
    this.responsesService.clearAll();
    return {
      success: true,
      message: 'All responses cleared',
    };
  }
}
