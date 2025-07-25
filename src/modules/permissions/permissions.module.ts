import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PermissionsController } from './permissions.controller';
import { OvertimeTypeController } from './overtime-type.controller';
import {
  PermissionsStoreService,
  PermissionsUpdateService,
  PermissionsDeleteService,
} from './services';
import { PermissionListService } from './services/permission-list.service';
import { OvertimeTypeService } from './services/overtime-type.service';
import { DbService } from '../../config/database.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [PermissionsController, OvertimeTypeController],
  providers: [
    PermissionsStoreService,
    PermissionsUpdateService,
    PermissionsDeleteService,
    PermissionListService,
    OvertimeTypeService,
    DbService,
  ],
})
export class PermissionsModule {}
