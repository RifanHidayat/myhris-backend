import { Controller, Body, Headers, Get } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './services/dashboard-service';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly dashboardService: DashboardService) {}

  //@UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
    @Headers('x-start-periode') startPeriode: string,
    @Headers('x-end-periode') endPeriode: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      tenant,
      emId,
      branchId,
      startPeriode,
      endPeriode,
    };

    return this.dashboardService.index(dtoWithHeaders);
  }
}
//   @Post('detail')
//   async detail(@Body() dto: EmployeeDetailDto) {
//     return this.employeeService.detail(dto);
//   }
// }
