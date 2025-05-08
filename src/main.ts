import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('LeaderBoard- API')
    .setDescription('Platform API')
    .setVersion('v1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app as any, options);
  SwaggerModule.setup('api', app as any, document);

  app.use(cookieParser()); // ← обов’язково

  app.enableCors({
    origin: 'http://localhost:3000', // ← змінюй під себе
    credentials: true, // ← дозволити надсилання cookie
  });

  await app.listen(3000);
}
bootstrap();
