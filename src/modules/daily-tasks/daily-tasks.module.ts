import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { DailyTasksController } from './daily-tasks.controller';
import { DailyTasksStoreService } from './services/daily-task-store.service';
import { DailyTaskListService } from './services/daily-task-list.service';
import { DailyTasksDeleteService } from './services/daily-tasks-delete.service';
import { DailyTasksUpdateService } from './services/daily-task-update.service';
import { DailyTaskListTaskPdfService } from './services/daily-task-list-task-pdf.services';
import { DailyTaskListTaskService } from './services/daily-task-list-task.service';
import { DailyTaskDetailService } from './services/daily-task-detail.service';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [DailyTasksController],
  providers: [
    DailyTasksStoreService,
    DailyTaskListService,
    DailyTasksDeleteService,
    DailyTasksUpdateService,
    DailyTaskListTaskPdfService,
    DailyTaskListTaskService,
    DailyTaskDetailService,
    DbService,
  ],
  exports: [
    DailyTasksStoreService,
    DailyTaskListService,
    DailyTasksDeleteService,
    DailyTasksUpdateService,
    DailyTaskListTaskPdfService,
    DailyTaskListTaskService,
    DailyTaskDetailService,
  ],
})
export class DailyTasksModule {}
