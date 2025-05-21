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
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  
  try {
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

    // Log Redis configuration
    logger.log(`Redis Host: ${configService.get('REDIS_HOST')}`);
    logger.log(`Redis Port: ${configService.get('REDIS_PORT')}`);
    logger.log(`Redis Cache TTL: ${configService.get('REDIS_CACHE_TTL')} ms`);

    // Start the application
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/${API_PREFIX}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/`);
    console.log(`Swagger documentation is also available at: http://localhost:${port}/${SWAGGER_PATH}`);
  } catch (error) {
    logger.error(`Error starting application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
