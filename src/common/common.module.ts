import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { NotificationService } from './notification.service';
import { FirebaseConfig } from '../config/firebase.config';
import { DbService } from '../config/database.service';

@Module({
  providers: [FcmService, NotificationService, FirebaseConfig, DbService],
  exports: [FcmService, NotificationService],
})
export class CommonModule {} 