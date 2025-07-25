import { Controller, Get, Param, UseGuards, Req, Body, Post, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DailyTasksStoreService } from './services/daily-task-store.service';
import { DailyTaskListService } from './services/daily-task-list.service';
import { DailyTasksDeleteService } from './services/daily-tasks-delete.service';
import { DailyTasksUpdateService } from './services/daily-task-update.service';
import { DailyTaskDraftUpdateService } from './services/daily-task-draft-update';
import { DailyTaskListTaskPdfService } from './services/daily-task-list-task-pdf.services';
import { DailyTaskListTaskService } from './services/daily-task-list-task.service';

/**
 * Controller untuk menu Tugas Harian
 */
@Controller('daily-tasks')
export class DailyTasksController {
  constructor(
    private readonly storeService: DailyTasksStoreService,
    private readonly listService: DailyTaskListService,
    private readonly deleteService: DailyTasksDeleteService,
    private readonly updateService: DailyTasksUpdateService,
    private readonly draftUpdateService: DailyTaskDraftUpdateService,
    private readonly listTaskPdfService: DailyTaskListTaskPdfService,
    private readonly listTaskService: DailyTaskListTaskService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    // TODO: Implementasi pengambilan data tugas harian
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    // TODO: Implementasi pengambilan semua data tugas harian
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    // TODO: Implementasi pengambilan data tugas harian by ID
    return { id, tenant, emId, startPeriode, endPeriode };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    // TODO: Implementasi pengambilan detail tugas harian by ID
    return { id, tenant, emId, startPeriode, endPeriode };
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Body() body: any
  ): Promise<any> {
    // Merge globalParams, body, dan headers untuk service call
    return this.storeService.insertDailyTask({ ...req.globalParams, ...body, tenant, emId, startPeriode, endPeriode });
  }
}
