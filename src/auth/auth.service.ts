import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getAllUser() {
    return this.prisma.user.findMany();
  }
  async register(name: string, email: string, phone: string, password: string) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const regexPhone = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    const emailExist = await this.prisma.user.findUnique({ where: { email } });
    const phoneExist = await this.prisma.user.findUnique({ where: { phone } });

    if (!regexEmail.test(email))
      throw new BadRequestException('Email không hợp lệ');

    if (!regexPhone.test(phone))
      throw new BadRequestException('Số điện thoại không hợp lệ');

    // check email ton tai
    if (emailExist) throw new UnauthorizedException('Email đã tồn tại');

    if (phoneExist) throw new UnauthorizedException('Số điện thoại đã tồn tại');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { name, phone, email, password: hashed },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
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
      throw new BadRequestException('Email hoặc số điện thoại không tồn tại');

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) throw new BadRequestException('Sai mật khẩu');

    const payload = { id: user.id, phone: user.phone };
    const { password: safePassword, ...userRes } = user;

    return {
      message: 'Đăng nhập thành công',
      user: userRes,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
