import { Controller, Get, Post, Body, Query, UseGuards, Req, Headers } from '@nestjs/common';
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
  async list(@Req() req: any, @Query() query: any): Promise<any> {
    return this.listService.historyCuti({ ...req.globalParams, ...query });
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Body() body: any,
  ): Promise<any> {
    return this.storeService.store({ ...body, tenant, emId, startPeriode, endPeriode });
  }
}
