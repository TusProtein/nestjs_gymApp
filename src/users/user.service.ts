import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  testUser(): string {
    return 'Hello Tusprotein!';
  }
}
