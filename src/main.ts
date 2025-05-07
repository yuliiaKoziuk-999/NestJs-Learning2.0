import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ← обов’язково

  app.enableCors({
    origin: 'http://localhost:3000', // ← змінюй під себе
    credentials: true, // ← дозволити надсилання cookie
  });

  await app.listen(3000);
}
bootstrap();
