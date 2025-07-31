import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './config/database.service';
import { HeaderContextMiddleware } from './middleware/tenant.middleware';
import { ConfigModule } from '@nestjs/config';
// import { JwtStrategy } from './modules/auth/jwt.strategy';
// import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

//modules
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employees/employee.module';
import { ActivitiesModule } from './modules/activities/activity.module';
import { ImboxModule } from './modules/imbox/imbox.module';
import { AttendanceModule } from './modules/attendances/attendance.module';
import { DailyTasksModule } from './modules/daily-tasks/daily-tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env', '.env'], // Try both env and .env files
      cache: false, // Disable cache for debugging
    }),
    AuthModule,
    EmployeeModule,
    ActivitiesModule,
    ImboxModule,
    AttendanceModule,
    DailyTasksModule,
    DashboardModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
  exports: [DbService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HeaderContextMiddleware)
      .exclude('auth/database')
      .forRoutes('*'); // Middleware berlaku untuk semua route kecuali auth/database
  }
}
