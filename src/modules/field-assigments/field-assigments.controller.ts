import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FieldAssigmentsListService } from './services/field-assigments-list';
import { FieldAssigmentsStoreService } from './services/field-assigments-store.service';

@Controller('field-assigments')
export class FieldAssigmentsController {
  constructor(
    private readonly listService: FieldAssigmentsListService,
    private readonly storeService: FieldAssigmentsStoreService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@Query() query: any): Promise<any> {
    return this.listService.list(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(@Body() body: any): Promise<any> {
    return this.storeService.store(body);
  }
} 