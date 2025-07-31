import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttendanceListService } from './services/attendance.list.services';
import { SubmitAttendanceService } from './services/submit-attendance.services';
import { SubmitAttendanceBreakService } from './services/submit-attendance-break.services';
import { PlaceCoordinateService } from './services/placecoordinate-service';
import { getDateNow } from '../../common/utils';
import { SubmitAttendanceFormDataDto } from './dto/submit-attendance.dto';
import { SubmitAttendanceBreakFormDataDto } from './dto/submit-attendance-break.dto';
// import { EmployeeDetailDto } from './dto/employee-detail.dto';

/**
 * Controller untuk menu Attendances
 */
@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly attendanceListService: AttendanceListService,
    private readonly submitAttendanceService: SubmitAttendanceService,
    private readonly submitAttendanceBreakService: SubmitAttendanceBreakService,
    private readonly placeCoordinateService: PlaceCoordinateService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('branch_id') branchId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
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
  @Get('place-coordinates')
  async getPlaceCoordinates(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('branch_id') branchId: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    const dtoWithHeaders = {
      tenant,
      emId,
      branchId,
    };
    return this.placeCoordinateService.index(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAttendanceById(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('tenant harus disediakan');
    }
    return this.submitAttendanceBreakService.getAttendanceById(id, tenant);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateAttendanceById(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Body() dto: any,
    @Req() req: any
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('tenant harus disediakan');
    }
    return this.submitAttendanceBreakService.updateAttendanceById(id, dto, tenant);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAttendanceById(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('tenant harus disediakan');
    }
    return this.submitAttendanceBreakService.deleteAttendanceById(id, tenant);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @UseInterceptors(FileInterceptor('image'))
  async submitAttendance(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Body() dto: SubmitAttendanceFormDataDto,
    @UploadedFile() image?: any,
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Map parameters to match AttendanceFormDataDto interface
    const attendanceDto = {
      database: tenant,
      em_id: emId,
      tanggal_absen: dto.date || getDateNow(), // Changed from dto.tanggal_absen to dto.date
      reg_type: dto.reg_type || 1,
      type_attendance: dto.type_attendance,
      location: dto.location,
      note: dto.note,
      lat_lang: dto.lat_lang,
      place: dto.place,
      category: dto.category,
      image, // Uploaded file from FormData
    };
    
    return this.submitAttendanceService.submitAttendance(attendanceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit-break')
  @UseInterceptors(FileInterceptor('image'))
  async submitAttendanceBreak(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Body() dto: SubmitAttendanceBreakFormDataDto,
    @UploadedFile() image?: any,
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Combine body data with uploaded file
    const formData = {
      database: tenant,
      em_id: emId,
      date: dto.date, // Changed from tanggal_absen to date
      reg_type: dto.reg_type,
      type_attendance: dto.type_attendance,
      location: dto.location,
      note: dto.note,
      lat_lang: dto.lat_lang,
      place: dto.place,
      category: dto.category,
      start_date: dto.start_date,
      end_date: dto.end_date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      break_type: dto.break_type,
      break_duration: dto.break_duration,
      image, // Uploaded file from FormData
    };
    
    return this.submitAttendanceBreakService.submitAttendanceBreak(formData);
  }
}
//   @Post('detail')
//   async detail(@Body() dto: EmployeeDetailDto) {
//     return this.employeeService.detail(dto);
//   }
// }
