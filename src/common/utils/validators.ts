import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const validateAndHashPassword = async (
  prisma: PrismaService,
  email: string,
  phone: string,
  password: string,
) => {
  const [emailExist, phoneExist] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phone } }),
  ]);

  if (emailExist) throw new ConflictException('Email đã tồn tại');
  if (phoneExist) throw new ConflictException('Số điện thoại đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);

  return hashed;
};

export default validateAndHashPassword;
