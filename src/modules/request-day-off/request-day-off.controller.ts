import { Controller, Put, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestDayOffUpdateService } from './services/request-day-off.update-service';

@Controller('request-day-off')
export class RequestDayOffController {
  constructor(private readonly requestDayOffUpdateService: RequestDayOffUpdateService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    return this.requestDayOffUpdateService.dayOffUpdate({ ...dto, id, database: tenant });
  }
}
