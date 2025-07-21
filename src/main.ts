import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug: log env yang penting
  console.log('DB_HOST:', process.env.DB_HOST);

  const app = await NestFactory.create(AppModule);

  // (Opsional) Aktifkan CORS jika perlu
  // app.enableCors();

  app.setGlobalPrefix('api');

  // (Opsional) Global validation pipe
  // import { ValidationPipe } from '@nestjs/common';
  // app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
