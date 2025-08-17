import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  testAuth(): string {
    return 'Hello Auth!';
  }
}
