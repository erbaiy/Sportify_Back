


import { Module } from '@nestjs/common';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventsModule } from './events/events.module';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';

import { RegistrationModule } from './registrations/registration.module';




@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MulterModule.register(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    EventsModule,
    RegistrationModule,
  ],
})
export class AppModule {}