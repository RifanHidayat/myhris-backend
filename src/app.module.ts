import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from '../src/config/database.service';
import { HeaderContextMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DbService], // Pastikan DbService juga di sini
  exports: [DbService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HeaderContextMiddleware)
      .forRoutes('*'); // Middleware berlaku untuk semua route
  }
}
