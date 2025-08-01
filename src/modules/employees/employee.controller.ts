import {
  Controller,
  Body,
  Get,
  Post,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmployeeDetailService } from './services/employee-detail-service';
import { EmployeeListService } from './services/employee-list-service';
import { EmployeeLastAttendanceService } from './services/employee-last-attendance';
import { EmployeeDelegationService } from './services/employee-delegation.service';
import { EmployeeDivisionService } from './services/employee-division.service';
import { EmployeeFieldAssignmentsService } from './services/employee-field-assignments.service';

import { EmployeeDetailDto, LastAttendanceRequestDto } from './dto/employee-detail.dto';
import { GlobalParamsDto } from '../../common/dto/global-params.dto';

@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeDetailService,
    private readonly employeeListService: EmployeeListService,
    private readonly employeeLastAttendanceService: EmployeeLastAttendanceService,
    private readonly employeeDelegationService: EmployeeDelegationService,
    private readonly employeeDivisionService: EmployeeDivisionService,
    private readonly employeeFieldAssignmentsService: EmployeeFieldAssignmentsService,

  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  async fetchDatabase(
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, em_id, start_periode, end_periode } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    const dtoWithHeaders = {
      tenant,
      emId: em_id,
      startPeriode: start_periode,
      endPeriode: end_periode,
    };
    return this.employeeService.detail(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllEmployee(
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, em_id, branch_id, start_periode, end_periode } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!branch_id) {
      throw new BadRequestException('Branch ID parameter is required');
    }
    
    const dtoWithHeaders = {
      tenant,
      emId: em_id,
      branchId: branch_id,
      startPeriode: start_periode,
      endPeriode: end_periode,
    };
    return this.employeeListService.index(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('last-attendance')
  async getLastAttendanceAuto(
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, em_id, start_periode, end_periode, approver } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode) {
      throw new BadRequestException('Start period parameter is required');
    }
    if (!end_periode) {
      throw new BadRequestException('End period parameter is required');
    }
    
    // Map the parameters to match the LastAttendanceDto structure
    const lastAttendanceDto = {
      tenant: tenant,
      em_id: em_id,
      start_periode: start_periode,
      end_periode: end_periode,
      approver: approver || '',
    };
    
    return this.employeeLastAttendanceService.getLastAttendanceWithTimeConfig(lastAttendanceDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('last-attendance')
  // async viewLastAttendance(
  //   @Query() globalParams: GlobalParamsDto,
  //   @Body() dto: LastAttendanceRequestDto,
  //   @Req() req: any,
  // ): Promise<any> {
  //   const { tenant, em_id, start_periode, end_periode,approver } = globalParams;
    
  //   // Validate required parameters
  //   if (!tenant) {
  //     throw new BadRequestException('Tenant parameter is required');
  //   }
  //   if (!em_id) {
  //     throw new BadRequestException('Employee ID parameter is required');
  //   }
  //   if (!start_periode) {
  //     throw new BadRequestException('Start period parameter is required');
  //   }
  //   if (!end_periode) {
  //     throw new BadRequestException('End period parameter is required');
  //   }
    
  //   // Map the parameters to match the LastAttendanceDto structure
  //   const lastAttendanceDto = {
  //     tenant: tenant,
  //     em_id: em_id,
  //     start_periode: start_periode,
  //     end_periode: end_periode,
  //     approver: approver || '',
  //   };
    
  //   return this.employeeLastAttendanceService.viewLastAbsen(lastAttendanceDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('delegation-by-supervisor')
  async getDelegasiList(
    @Query() globalParams: GlobalParamsDto
  ) {
    const { tenant, em_id } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    return this.employeeDelegationService.employeeDelegasi(tenant, em_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('division')
  async getEmployeeDivisi(
    @Query() globalParams: GlobalParamsDto
  ) {
    const { tenant, em_id } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    return this.employeeDivisionService.employeeDivisi(tenant, em_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('field-assignments')
  async getFieldAssignmentsByEmployee(
    @Query() globalParams: GlobalParamsDto
  ) {
    const { tenant, em_id, start_periode, end_periode } = globalParams;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const dto = {
      tenant,
      em_id,
      start_periode,
      end_periode
    };
    
    return this.employeeFieldAssignmentsService.getFieldAssignmentsByEmployee(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('field-assignments-with-filters')
  async getFieldAssignmentsByEmployeeWithFilters(
    @Query() globalParams: GlobalParamsDto
  ) {
    const { tenant, em_id, start_periode, end_periode } = globalParams;
    const { status, date_from, date_to } = globalParams as any;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const dto = {
      tenant,
      em_id,
      start_periode,
      end_periode,
      status,
      date_from,
      date_to
    };
    
    return this.employeeFieldAssignmentsService.getFieldAssignmentsByEmployeeWithFilters(dto);
  }


}
