import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra properties for flexible deal types
    }),
  );

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('BACKEND_PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 FlowXchange Backend running on http://localhost:${port}`);
}

bootstrap();
