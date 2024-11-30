import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return this.authService.register(registerDto);
    } catch (error) {
      return error;
    }
  }

  @Post('login')
  async login(@Body() LoginDto: LoginDto) {
    try {
      return this.authService.login(LoginDto);
    }
    catch (error) {
      return error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('protected')
  getProtectedRoute() {
  return 'Cette route est protégée';
}

} 
