import { Controller, Post, Body, Headers } from '@nestjs/common';
import { DivisionListService } from './service/division.list.service';

@Controller('divisions')
export class DivisionController {
  constructor(private readonly divisionListService: DivisionListService) {}

  @Post('employee-divisi')
  async getEmployeeDivisi(
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
    return this.divisionListService.employeeDivisi(database, em_id);
  }
}
