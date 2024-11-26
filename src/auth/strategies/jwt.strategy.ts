import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class JwtStrategy {
  async validateToken(token: string): Promise<any> {
    try {
      return verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}