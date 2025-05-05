import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExeptionsFilter } from './all-exceptions.filter';
import { log } from 'node:console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExeptionsFilter(httpAdapter));

  app.enableCors();
  // app.setGlobalPrefix('api');
  await app.listen(3000);
}

console.log(process.env.PORT);
bootstrap();
