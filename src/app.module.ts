import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './config/database.service';
import { HeaderContextMiddleware } from './middleware/tenant.middleware';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [AppService, DbService], // Pastikan DbService juga di sini
  exports: [DbService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderContextMiddleware).forRoutes('*'); // Middleware berlaku untuk semua route
  }
}
