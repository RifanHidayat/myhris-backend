import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { DelegationController } from './delegation.controller';
import { DelegationListService } from './services/deletegation.list.service';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [DelegationController],
  providers: [
    DelegationListService,
    DbService,
  ],
  exports: [
    DelegationListService,
  ],
})
export class DelegationModule {}
