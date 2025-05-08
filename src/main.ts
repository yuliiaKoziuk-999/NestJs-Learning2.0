import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guards';
import { JwtService } from '@nestjs/jwt';

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

  app.use(cookieParser()); // ← обов’язково
  app.useGlobalGuards(new AuthGuard(jwtService, reflector));
  app.enableCors({
    origin: 'http://localhost:3000', //TODO move to env
    credentials: true, // ← дозволити надсилання cookie
  });

  await app.listen(3000);
}
bootstrap();
