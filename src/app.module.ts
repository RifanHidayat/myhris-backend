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
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    EmployeeModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
  exports: [DbService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderContextMiddleware).forRoutes('*'); // Middleware berlaku untuk semua route
  }
}
