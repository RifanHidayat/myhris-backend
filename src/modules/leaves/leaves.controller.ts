import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeavesListService } from './services/leave-list.services';
import { LeavesStoreService } from './services/leaves-store.service';

@Controller('leaves')
export class LeavesController {
  constructor(
    private readonly listService: LeavesListService,
    private readonly storeService: LeavesStoreService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@Query() query: any): Promise<any> {
    return this.listService.historyCuti(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(@Body() body: any): Promise<any> {
    return this.storeService.store(body);
  }
} 