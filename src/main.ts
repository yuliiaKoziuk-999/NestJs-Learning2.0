import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guards';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from './my-logger/my-logger.service';

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
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const logger = app.get(MyLoggerService);

  app.use(cookieParser());
  app.useGlobalGuards(new AuthGuard(jwtService, reflector, logger));
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
