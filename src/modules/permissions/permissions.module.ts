import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsStoreService, PermissionsUpdateService, PermissionsDeleteService } from './services';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsStoreService, PermissionsUpdateService, PermissionsDeleteService],
})
export class PermissionsModule {} 