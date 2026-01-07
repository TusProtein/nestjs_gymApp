import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkoutProgressDto } from './dto/create-workout-progress.dto';
import { UpdateWorkoutProgressDto } from './dto/update-workout-progress.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { JwtPayload } from '~/auth/jwt-payload.interface';

@Injectable()
export class WorkoutProgressService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateWorkoutProgressDto, ptId: number, gymId: number) {
    const { memberId, date } = dto;

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    const [member, pt] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.memberId, gymId } }),
      this.prisma.user.findUnique({ where: { id: ptId, gymId } }),
    ]);

    if (!member) throw new NotFoundException('Không tìm thấy học viên này');
    if (!pt) throw new NotFoundException('Không tìm thấy PT này');

    if (member.role !== UserRole.MEMBER)
      throw new BadRequestException('Người dùng này không phải là học viên');
    if (pt.role !== UserRole.PT)
      throw new BadRequestException('Người dùng này không phải là PT');

    const existing = await this.prisma.workoutProgress.findFirst({
      where: {
        memberId,
        ptId,
        date: parsedDate,
      },
    });

    if (existing)
      throw new BadRequestException(
        `Chương trình tập luyện cho học viên ${memberId} với PT ${ptId} trong ngày này đã tồn tại`,
      );

    const data = await this.prisma.workoutProgress.create({
      data: {
        ...dto,
        ptId,
        date: parsedDate,
        gymId,
      },
    });

    return {
      message: 'Tạo chương trình tập luyện thành công',
      data,
    };
  }

  async findByMember(memberId: number, currentUser: JwtPayload) {
    if (currentUser.role === UserRole.MEMBER) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    // PT chỉ xem học viên mình coach
    if (currentUser.role === UserRole.PT) {
      const hasAccess = await this.prisma.workoutProgress.findFirst({
        where: {
          memberId,
          ptId: currentUser.id,
          gymId: currentUser.gymId,
        },
      });

      if (!hasAccess)
        throw new ForbiddenException(
          'Bạn không có quyền xem tiến độ của học viên này',
        );
    }

    // Admin chỉ cần cùng gymId
    return this.prisma.workoutProgress.findMany({
      where: {
        memberId,
        gymId: currentUser.gymId,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findMyProgress(currentUser: JwtPayload) {
    if (currentUser.role !== UserRole.MEMBER) {
      throw new ForbiddenException('Chỉ có học viên mới truy cập được');
    }
    return this.prisma.workoutProgress.findMany({
      where: {
        memberId: currentUser.id,
        gymId: currentUser.gymId,
      },
      orderBy: { date: 'desc' },
    });
  }

  async update(
    id: number,
    dto: UpdateWorkoutProgressDto,
    currentUser: JwtPayload,
  ) {
    const exist = await this.prisma.workoutProgress.findFirst({
      where: { id, gymId: currentUser.gymId },
    });
    if (!exist) throw new NotFoundException('Tiến độ tập luyện không tồn tại');

    // Member không được update
    if (currentUser.role === UserRole.MEMBER)
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật tiến độ tập luyện',
      );

    // PT chỉ sửa progress của chính mình
    if (currentUser.role === UserRole.PT && exist.ptId !== currentUser.id)
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật tiến độ của học viên này',
      );

    // Validate date nếu có
    let parsedDate: Date | undefined;
    if (dto.date !== undefined) {
      parsedDate = new Date(dto.date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Ngày không hợp lệ');
      }
    }

    const data = await this.prisma.workoutProgress.update({
      where: { id },
      data: {
        ...dto,
        ...(parsedDate !== undefined && { date: parsedDate }),
      },
    });

    return {
      message: 'Cập nhật tiến độ tập luyện thành công',
      data,
    };
  }

  async delete(id: number, currentUser: JwtPayload) {
    const exist = await this.prisma.workoutProgress.findFirst({
      where: { id, gymId: currentUser.gymId },
    });

    if (!exist) throw new NotFoundException('Tiến độ tập luyện không tồn tại');

    if (currentUser.role === UserRole.MEMBER)
      throw new ForbiddenException('Bạn không có quyền xóa tiến độ tập luyện');

    if (currentUser.role === UserRole.PT && exist.ptId !== currentUser.id)
      throw new ForbiddenException(
        'Bạn không có quyền xóa tiến độ của học viên này',
      );

    const data = await this.prisma.workoutProgress.delete({ where: { id } });

    return {
      message: `Xóa tiến độ tập luyện thành công`,
      data,
    };
  }
}
