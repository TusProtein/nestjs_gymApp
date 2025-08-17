import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/auth')
  auth(): string {
    return this.authService.testAuth();
  }
}
