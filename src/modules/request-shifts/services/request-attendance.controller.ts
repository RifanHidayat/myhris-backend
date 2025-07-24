import {
  Controller,
  Body,
  Headers,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequestAttendanceStoreService } from '../../request-attendance/services/request-attendance-store.service';
import { RequestAttendanceUpdateService } from '../../request-attendance/services/request-attendance-update.service';
import { RequestAttendanceDeleteService } from '../../request-attendance/services/request-attendnce-delete.service';

/**
 * Controller untuk menu Permintaan Absensi
 */
@Controller('request-attendance')
export class RequestAttendanceController {
  constructor(
    private readonly requestAttendanceStoreService: RequestAttendanceStoreService,
    private readonly requestAttendanceUpdateService: RequestAttendanceUpdateService,
    private readonly requestAttendanceDeleteService: RequestAttendanceDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      tenant,
      emId,
      branchId,
    };

    return this.requestAttendanceStoreService.index(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      tenant,
      emId,
      branchId,
    };

    return this.requestAttendanceStoreService.getAllData(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      id,
      tenant,
      emId,
    };

    return this.requestAttendanceStoreService.show(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      id,
      tenant,
      emId,
    };

    return this.requestAttendanceStoreService.getById(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() dto: any,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      ...dto,
      tenant,
      emId,
    };

    return this.requestAttendanceStoreService.store(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      id,
      ...dto,
      tenant,
      emId,
    };

    return this.requestAttendanceUpdateService.update(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    const dtoWithHeaders = {
      id,
      tenant,
      emId,
    };

    return this.requestAttendanceDeleteService.delete(dtoWithHeaders);
  }
}
