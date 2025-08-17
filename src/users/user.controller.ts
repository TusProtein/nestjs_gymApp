import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('v1/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/user')
  user(): string {
    return this.userService.testUser();
  }
}
