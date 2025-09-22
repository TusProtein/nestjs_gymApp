import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { registerDto } from './dto/register.dto';
import { UsersService } from '~/users/user.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(dto: registerDto) {
    const user = await this.usersService.createUser({
      ...dto,
      role: UserRole.MEMBER,
    });

    return {
      message: 'Đăng ký thành công',
      data: user.user,
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

    const payload = { id: user.id, phone: user.phone, role: user.role };
    const { password: safePassword, ...userRes } = user;

    return {
      message: 'Đăng nhập thành công',
      user: userRes,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
