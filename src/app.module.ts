


import { Module } from '@nestjs/common';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}