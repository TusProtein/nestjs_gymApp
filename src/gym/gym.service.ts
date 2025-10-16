import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from '~/users/dto/create-user.dto';
import { SuperAdminCreateAdminDto } from './dto/super-admin-create-admin.dto';
import { UsersService } from '~/users/user.service';
import { AssignAdminDto } from './dto/assign-admin.dto';
import validateAndHashPassword from '~/common/utils/validators';

@Injectable()
export class GymService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  private async ensureExists(id: number, includeInactive = false) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });

    if (!gym || (!includeInactive && !gym.isActive)) {
      throw new NotFoundException(`Gym id ${id} không tồn tại`);
    }
    return gym;
  }
  async create(createGymDto: CreateGymDto) {
    const exist = await this.prisma.gym.findUnique({
      where: { name: createGymDto.name },
    });

    if (exist)
      throw new ConflictException(`Phòng gym ${exist.name} đã tồn tại`);

    const gym = await this.prisma.gym.create({
      data: {
        name: createGymDto.name,
        address: createGymDto.address ?? null,
      },
    });

    return {
      message: `Tạo phòng gym ${gym.name} thành công`,
      data: gym,
    };
  }

  findAll() {
    return this.prisma.gym.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.ensureExists(id);
  }

  async update(id: number, updateGymDto: UpdateGymDto) {
    const gym = await this.ensureExists(id);

    if (updateGymDto.name && updateGymDto.name !== gym.name) {
      // check confict trong DB
      const existing = await this.prisma.gym.findUnique({
        where: { name: updateGymDto.name },
      });
      if (existing) throw new ConflictException('Tên phòng tập đã tồn tại');
    }

    const updated = await this.prisma.gym.update({
      where: { id },
      data: {
        name: updateGymDto.name,
        address: updateGymDto.address,
        isActive: updateGymDto.isActive,
      },
    });

    return {
      message: `Cập nhật phòng gym id ${updated.id} thành công`,
      data: updated,
    };
  }

  async restore(id: number) {
    const gym = await this.ensureExists(id, true);

    if (gym.isActive) return { message: `Gym id ${id} đang active` };

    await this.prisma.gym.update({ where: { id }, data: { isActive: true } });
    return { message: `Đã khôi phục gym id ${id}` };
  }

  async disable(id: number) {
    const gym = await this.ensureExists(id);

    if (!gym.isActive)
      return { message: `Gym id ${id} đã bị disable trước đó rồi` };

    await this.prisma.gym.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: `Đã vô hiệu hóa phòng gym id ${id}`,
    };
  }

  async hardDelete(id: number) {
    const gym = await this.ensureExists(id, true);
    await this.prisma.gym.delete({ where: { id } });

    return {
      message: `Đã xóa hẳn phòng gym id ${id}`,
    };
  }

  // Thống kê số liệu của từng gym
  async findAllWithStats() {
    const gyms = await this.prisma.gym.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(
      gyms.map(async (gym) => {
        const [totalUsers, admins, pts, members] = await Promise.all([
          this.prisma.user.count({ where: { gymId: gym.id } }),
          this.prisma.user.count({
            where: { gymId: gym.id, role: UserRole.ADMIN },
          }),
          this.prisma.user.count({
            where: { gymId: gym.id, role: UserRole.PT },
          }),
          this.prisma.user.count({
            where: { gymId: gym.id, role: UserRole.MEMBER },
          }),
        ]);

        return {
          ...gym,
          stats: { totalUsers, admins, pts, members },
        };
      }),
    );

    return result;
  }

  // Gán Admin cho Gym (update)
  async assignExistingUserAsAdmin(gymId: number, adminId: number) {
    const gym = await this.ensureExists(gymId);

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        gymId,
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin)
      throw new ConflictException(
        `Phòng gym ${gym.name} đã có Admin ${existingAdmin.name} `,
      );

    const admin = await this.prisma.user.findFirst({
      where: { id: adminId, role: UserRole.ADMIN, gymId: null },
    });

    if (!admin)
      throw new NotFoundException(
        `Admin id ${adminId} không tồn tại hoặc không hợp lệ để gán làm admin`,
      );

    // update role và gymId
    const updated = await this.prisma.user.update({
      where: { id: adminId },
      data: {
        gymId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        gymId: true,
      },
    });
    return {
      message: 'Gán Admin thành công',
      data: updated,
    };
  }
  async createAdminForGym(gymId: number, dto: SuperAdminCreateAdminDto) {
    const gym = await this.ensureExists(gymId);

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        gymId,
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin)
      throw new ConflictException(
        `Phòng gym ${gym.name} đã có Admin ${existingAdmin.name}`,
      );

    const { name, email, phone, dateOfBirth, password } = dto;

    const hashed = await validateAndHashPassword(
      this.prisma,
      email,
      phone,
      password,
    );

    const admin = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        password: hashed,
        role: UserRole.ADMIN,
        gymId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        gymId: true,
      },
    });

    return {
      message: 'Tạo Admin thành công',
      data: admin,
    };
  }

  async getUsersByGym(gymId: number, role?: UserRole) {
    await this.ensureExists(gymId);
    const where: any = { gymId };

    if (role) where.role = role;
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: users,
    };
  }
}
