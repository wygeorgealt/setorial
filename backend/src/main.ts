import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Use require for CommonJS module to ensure it is callable without esModuleInterop flags
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable HTTP compression for faster responses
  app.use(compression());
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
