import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

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
    createdAt: true,
    updatedAt: true,
  };

  // Admin create user
  async createUser(dto: CreateUserDto) {
    const { email, phone, password, dateOfBirth, name, role } = dto;

    const [emailExist, phoneExist] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phone } }),
    ]);

    if (emailExist) throw new ConflictException('Email đã tồn tại');
    if (phoneExist) throw new ConflictException('Số điện thoại đã tồn tại');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        password: hashed,
        role,
      },
      select: this.userSelect,
    });

    return {
      message: 'Admin tạo tài khoản thành công',
      user,
    };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update User
  async updateUser(id: number, dto: UpdateUserDto) {
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
  async deleteUser(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select: { id: true, email: true },
      });

      return {
        success: true,
        message: 'User deleted successfully',
        data: deletedUser,
      };
    } catch (error) {
      console.log(error);

      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
