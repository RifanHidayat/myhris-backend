import { Controller, Req, Get, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './services/dashboard-service';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(@Req() req, @Body() body: any): Promise<any> {
    const { database, emId, branchId, startPeriode, endPeriode } = req.globalParams;
    // body tetap bisa digunakan jika ada
    const dtoWithHeaders = {
      tenant: database, // mapping database to tenant
      emId,
      branchId,
      startPeriode,
      endPeriode,
      ...body, // merge body jika ada field tambahan
    };
    return this.dashboardService.index(dtoWithHeaders);
  }
}
//   @Post('detail')
//   async detail(@Body() dto: EmployeeDetailDto) {
//     return this.employeeService.detail(dto);
//   }
// }
