import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import validateAndHashPassword from '~/common/utils/validators';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayload } from '~/auth/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    dateOfBirth: true,
    role: true,
    gymId: true,
    createdAt: true,
    updatedAt: true,
  };

  // Admin create user
  async createUserByAdmin(dto: CreateUserDto, admin: JwtPayload) {
    const { email, phone, password, dateOfBirth, name, role } = dto;

    if (role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Không được phép tạo SUPER ADMIN');
    }

    if (role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin không thể tạo Admin khác');
    }

    if (!admin.gymId) {
      throw new BadRequestException('Admin chưa có gym, không thể tạo user');
    }

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
        dateOfBirth: new Date(dateOfBirth),
        password: hashed,
        role,
        gymId: admin.gymId,
      },
      select: this.userSelect,
    });

    return {
      message: 'Admin tạo tài khoản thành công',
      data: user,
    };
  }

  async findAll(gymId: number) {
    return this.prisma.user.findMany({
      where: { gymId },
      select: this.userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update User
  async updateUser(id: number, dto: UpdateUserDto, gymId: number) {
    const { email, phone } = dto;

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    if (user.gymId !== gymId)
      throw new BadRequestException('Không thể cập nhật người dùng này');

    const [emailExist, phoneExist] = await Promise.all([
      this.prisma.user.findFirst({ where: { email, NOT: { id } } }),
      this.prisma.user.findFirst({ where: { phone, NOT: { id } } }),
    ]);

    if (emailExist) throw new ConflictException('Email đã tồn tại');
    if (phoneExist) throw new ConflictException('Số điện thoại đã tồn tại');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
      select: this.userSelect,
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  // Delete User
  async deleteUser(id: number, gymId: number) {
    const user = await this.prisma.user.findFirst({ where: { id, gymId } });

    if (!user) throw new BadRequestException('Không tìm thấy người dùng này');

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });

    return {
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    };
  }
}
