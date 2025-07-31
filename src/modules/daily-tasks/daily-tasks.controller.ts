import { Controller, Get, Param, UseGuards, Req, Body, Post, Put, Delete, Query, BadRequestException, Patch, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DailyTasksStoreService } from './services/daily-task-store.service';
import { DailyTaskListService } from './services/daily-task-list.service';
import { DailyTasksDeleteService } from './services/daily-tasks-delete.service';
import { DailyTasksUpdateService } from './services/daily-task-update.service';
import { DailyTaskListTaskPdfService } from './services/daily-task-list-task-pdf.services';
import { DailyTaskListTaskService } from './services/daily-task-list-task.service';
import { DailyTaskDetailService } from './services/daily-task-detail.service';

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
    private readonly listTaskPdfService: DailyTaskListTaskPdfService,
    private readonly listTaskService: DailyTaskListTaskService,
    private readonly detailService: DailyTaskDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Parse date untuk mendapatkan bulan dan tahun
    const startDate = new Date(startPeriode);
    const bulan = String(startDate.getMonth() + 1);
    const tahun = String(startDate.getFullYear());
    
    const dtoWithHeaders = {
      database: tenant,
      em_id: emId,
      bulan,
      tahun,
      tenant,
      emId,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.listService.getAllDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Parse date untuk mendapatkan bulan dan tahun
    const startDate = new Date(startPeriode);
    const bulan = String(startDate.getMonth() + 1);
    const tahun = String(startDate.getFullYear());
    
    const dtoWithHeaders = {
      database: tenant,
      em_id: emId,
      bulan,
      tahun,
      tenant,
      emId,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.listService.getAllDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/list-task')
  async getListTask(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    // Parse date untuk mendapatkan bulan dan tahun
    const startDate = new Date(startPeriode);
    const bulan = String(startDate.getMonth() + 1);
    const tahun = String(startDate.getFullYear());
    
    const dtoWithHeaders = {
      database: tenant,
      em_id: emId,
      id,
      bulan,
      tahun,
      tenant,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.listTaskService.getDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async getListTaskPdf(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Parse date untuk mendapatkan bulan dan tahun
    const startDate = new Date(startPeriode);
    const bulan = String(startDate.getMonth() + 1);
    const tahun = String(startDate.getFullYear());
    
    const dtoWithHeaders = {
      database: tenant,
      em_id: emId,
      bulan,
      tahun,
      tenant,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.listTaskPdfService.streamDailyTaskPDF(dtoWithHeaders, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    const dtoWithHeaders = {
      id,
      em_id: emId,
      tenant,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.detailService.getDailyTaskById(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    const dtoWithHeaders = {
      id,
      em_id: emId,
      tenant,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.detailService.getDailyTaskById(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any, 
    @Body() body: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Merge globalParams, body, dan headers untuk service call
    const dtoWithHeaders = {
      ...req.globalParams, 
      ...body, 
      tenant, 
      em_id: emId, // Map emId to em_id for service
      startPeriode, 
      endPeriode 
    };
    
    return this.storeService.insertDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Post('store-draft')
  async storeDraft(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any, 
    @Body() body: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    
    // Merge globalParams, body, dan headers untuk service call
    const dtoWithHeaders = {
      ...req.globalParams, 
      ...body, 
      tenant, 
      em_id: emId,
      status: 'draft', // Set status to draft for draft endpoint
      start_periode: startPeriode, 
      end_periode: endPeriode 
    };
    
    return this.storeService.insertDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any,
    @Body() body: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    console.log('Update daily task with params:', { id, tenant, emId, startPeriode, endPeriode });
    console.log('Update daily task body:', body);
    
    const dtoWithHeaders = {
      id,
      em_id: emId,
      ...req.globalParams,
      ...body,
      tenant,
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.updateService.updateDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-draft/:id')
  async updateDraft(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any,
    @Body() body: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    const dtoWithHeaders = {
      id,
      em_id: emId,
      ...req.globalParams,
      ...body,
      tenant,
      status: 'draft', // Set status to draft for draft endpoint
      start_periode: startPeriode,
      end_periode: endPeriode,
    };
    
    return this.updateService.updateDailyTask(dtoWithHeaders);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId || !id) {
      throw new BadRequestException('tenant, em_id, dan id harus disediakan');
    }
    
    return this.deleteService.deleteDailyTask(emId, id, tenant, startPeriode, endPeriode);
  }
}
