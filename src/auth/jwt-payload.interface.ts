import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
