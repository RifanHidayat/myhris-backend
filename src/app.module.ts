import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from '../../hris-backend/src/config/database.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
   exports: [DbService],
})
export class AppModule {}
