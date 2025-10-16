import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import validateAndHashPassword from '~/common/utils/validators';
import { PrismaService } from '../../prisma/prisma.service';
import { registerDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async selfRegister(dto: registerDto) {
    const { name, email, phone, password, dateOfBirth, gymId } = dto;

    if (!gymId) throw new BadRequestException('Vui lòng chọn phòng gym');

    const gym = await this.prisma.gym.findFirst({
      where: { id: gymId, isActive: true },
    });

    if (!gym)
      throw new BadRequestException(
        'Phòng gym không tồn tại hoặc đã bị vô hiệu hóa',
      );

    const hashed = await validateAndHashPassword(
      this.prisma,
      email,
      phone,
      password,
    );

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        dateOfBirth: new Date(dateOfBirth),
        role: UserRole.MEMBER,
        gymId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        gymId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Đăng ký thành công',
      data: user,
    };
  }

  async login(identifier: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
    });
    if (!user)
      throw new UnauthorizedException('Email hoặc số điện thoại không tồn tại');

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) throw new UnauthorizedException('Sai mật khẩu');

    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      gymId: user.gymId,
    };
    const { password: safePassword, ...userRes } = user;

    return {
      message: 'Đăng nhập thành công',
      user: userRes,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
