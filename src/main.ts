import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_PATH,
  API_PREFIX,
} from './shared/constants/app.constants';
import { GlobalExceptionFilter } from './core/exceptions/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addBearerAuth()
    .addServer(`/${API_PREFIX}`)
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Serve Swagger UI at the root path and at the specific Swagger path
  SwaggerModule.setup('', app, document);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
  
  // Set global prefix AFTER Swagger setup to avoid prefix for Swagger UI
  app.setGlobalPrefix(API_PREFIX);

  // Start the application
  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${API_PREFIX}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/`);
  console.log(`Swagger documentation is also available at: http://localhost:${port}/${SWAGGER_PATH}`);
}

bootstrap();
