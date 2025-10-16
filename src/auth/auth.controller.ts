import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dto/register.dto';

@Controller('v1/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: registerDto) {
    return this.authService.selfRegister(dto);
  }

  @Post('login')
  login(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(identifier, password);
  }
}
