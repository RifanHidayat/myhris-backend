import {
  Controller,
  Body,
  Headers,
  Get,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmployeeDetailService } from './services/employee-detail-service';
import { EmployeeListService } from './services/employee-list-service';
import { EmployeeLastAttendanceService } from './services/eemployee-last-attendance';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeDetailService,
    private readonly employeeListService: EmployeeListService,
    private readonly employeeLastAttendanceService: EmployeeLastAttendanceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  async fetchDatabase(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Req() req: any,
  ): Promise<any> {
    const dtoWithHeaders = {
      tenant,
      emId,
    };
    return this.employeeService.detail(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllEmployee(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
    @Headers('x-start-periode') startPeriode: string,
    @Headers('x-end-periode') endPeriode: string,
    @Req() req: any,
  ): Promise<any> {
    const dtoWithHeaders = {
      tenant,
      emId,
      branchId,
      startPeriode,
      endPeriode,
    };
    return this.employeeListService.index(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Post('last-attendance')
  async viewLastAttendance(@Body() dto: any, @Req() req: any): Promise<any> {
    return this.employeeLastAttendanceService.viewLastAbsen(dto);
  }
}
//   @Post('detail')
//   async detail(@Body() dto: EmployeeDetailDto) {
//     return this.employeeService.detail(dto);
//   }
// }
