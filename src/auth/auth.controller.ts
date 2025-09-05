import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('users')
  getAllUser() {
    return this.authService.getAllUser();
  }

  @Post('register')
  register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(name, email, phone, password);
  }

  @Post('login')
  login(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(identifier, password);
  }
}
