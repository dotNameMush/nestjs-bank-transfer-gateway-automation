import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 5000;

  hbs.registerHelper('eq', function (a, b) {
    return a === b;
  });

  hbs.registerHelper('formatDate', function (date) {
    return new Date(date).toLocaleString();
  });

  app.useStaticAssets(join(process.cwd(), '/', 'public'));
  app.setBaseViewsDir(join(process.cwd(), '/', 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          imgSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
          connectSrc: ["'self'", 'https:', 'ws:'],
        },
      },
      // Prevent clickjacking
      frameguard: { action: 'deny' },
      // Hide "X-Powered-By: Express" header
      hidePoweredBy: true,
      // Prevent MIME type sniffing
      noSniff: true,
      // Enable XSS filter (already enabled in modern browsers, but setting it explicitly)
      xssFilter: true,
      // Prevent DNS prefetching
      dnsPrefetchControl: { allow: false },
    }),
  );

  app.enableCors({
    // origin: '*',
    origin: ['http://localhost:5000', 'https://yourdomain.com'],
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
    exposedHeaders: '*',
    preflightContinue: false,
    credentials: true, // Allows cookies to be sent with requests
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  });

  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`App is running on: http://localhost:${port}`);
}
bootstrap();
