import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
          throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        return {
          uri,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}