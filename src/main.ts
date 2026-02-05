import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  // --- Swagger setup ---
  const config = new DocumentBuilder()
    .setTitle('SupplyNow API')
    .setDescription('API documentation for SupplyNow project')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // ---------------------

  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}

bootstrap();
