import { Controller, Post, Body, Headers } from '@nestjs/common';
import { DelegationListService } from './services/deletegation.list.service';

@Controller('delegations')
export class DelegationController {
  constructor(private readonly delegationListService: DelegationListService) {}

  @Post('delegasi-list')
  async getDelegasiList(
    @Body() body: { database?: string; em_id?: string },
    @Headers('x-tenant') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
    @Headers('x-start-periode') startPeriode: string,
    @Headers('x-end-periode') endPeriode: string
  ) {
    const database = body.database || tenant;
    const em_id = body.em_id || emId;
    // branchId, startPeriode, endPeriode bisa diteruskan ke service jika diperlukan
    return this.delegationListService.employeeDelegasi(database, em_id);
  }
}
