import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() registerDto: RegisterDto) {
    return this.authService.login(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get('protected')
  getProtectedRoute() {
  return 'Cette route est protégée';
}

}
