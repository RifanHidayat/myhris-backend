import { Controller, Req, Get, UseGuards, Body, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './services/dashboard-service';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(@Req() req, @Body() body: any, @Query() query: any): Promise<any> {
    // Handle case where globalParams might be undefined
    const globalParams = req.globalParams || {};
    const { database, emId, branchId, startPeriode, endPeriode } = globalParams;
    
    // Use query parameters as fallback if globalParams is not available
    const tenant = database || query.tenant;
    const employeeId = emId || query.em_id;
    const branch = branchId || query.branch_id;
    const startPeriod = startPeriode || query.start_periode;
    const endPeriod = endPeriode || query.end_periode;
    
    // Validate required parameters
    if (!tenant || !employeeId) {
      return {
        status: false,
        message: 'tenant dan em_id harus disediakan',
        data: null
      };
    }
    
    // body tetap bisa digunakan jika ada
    const dtoWithHeaders = {
      tenant: tenant, // mapping database to tenant
      emId: employeeId,
      branchId: branch,
      startPeriode: startPeriod,
      endPeriode: endPeriod,
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
