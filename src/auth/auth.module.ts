import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtStrategy } from './strategies/jwt.strategy';
dotenv.config();


@Module({

  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,  // Secret key for signing JWTs
      signOptions: { expiresIn: '60s' },  // Set expiration for tokens
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtModule,JwtStrategy],
  exports: [AuthService],

})
export class AuthModule {}
