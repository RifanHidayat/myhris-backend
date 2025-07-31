import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PermissionsController } from './permissions.controller';
import { OvertimeTypeController } from './overtime-type.controller';
import { PermissionsStoreService } from './services/permissions-store.service';
import { PermissionsUpdateService } from './services/permissions-update.service';
import { PermissionsDeleteService } from './services/permissions-delete.service';
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
  exports: [
    PermissionsStoreService,
    PermissionsUpdateService,
    PermissionsDeleteService,
    PermissionListService,
    OvertimeTypeService,
  ],
})
export class PermissionsModule {}
