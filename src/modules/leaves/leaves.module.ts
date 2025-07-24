import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesListService } from './services/leave-list.services';
import { LeavesStoreService } from './services/leaves-store.service';

@Module({
  controllers: [LeavesController],
  providers: [LeavesListService, LeavesStoreService],
})
export class LeavesModule {}
