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
import { AttendanceListService } from './services/attendance.list.services';
import { SubmitAttendanceService } from './services/submit-attendance.services';
import { SubmitAttendanceBreakService } from './services/submit-attendance-break.services';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

@Controller('attedance')
export class EmployeeController {
  constructor(
    private readonly attendanceListService: AttendanceListService,
    private readonly submitAttendanceService: SubmitAttendanceService,
    private readonly submitAttendanceBreakService: SubmitAttendanceBreakService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAll(
    @Req() req: any,
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
    return this.attendanceListService.index(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitAttendance(@Req() req: any, @Body() dto: any): Promise<any> {
    return this.submitAttendanceService.submitAttendance(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit-break')
  async submitAttendanceBreak(@Req() req: any, @Body() dto: any): Promise<any> {
    return this.submitAttendanceBreakService.submitAttendanceBreak(dto);
  }
}
//   @Post('detail')
//   async detail(@Body() dto: EmployeeDetailDto) {
//     return this.employeeService.detail(dto);
//   }
// }
