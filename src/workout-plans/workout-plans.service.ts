import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async findByMember(memberId: number) {
    const plans = await this.prisma.workoutPlan.findMany({
      where: { memberId },
      orderBy: { date: 'asc' },
    });
    if (!plans.length) throw new NotFoundException('Chưa có lịch tập');
    return plans;
  }

  async create(dto: CreateWorkoutPlanDto, ptId: number) {
    const { title, content, date, memberId } = dto;

    const exists = await this.prisma.workoutPlan.findFirst({
      where: { memberId, ptId, date: new Date(date) },
    });

    if (exists)
      throw new ConflictException(
        `Member ${memberId} đã có lịch tập với PT ${ptId} trong ngày này`,
      );

    const data = await this.prisma.workoutPlan.create({
      data: {
        title,
        content,
        date: new Date(date),
        memberId,
        ptId,
      },
    });

    return {
      message: 'Tạo lịch tập thành công',
      data,
    };
  }

  async findById(id: number) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Không tìm thấy plan id ${id}`);
    return plan;
  }

  async update(id: number, dto: UpdateWorkoutPlanDto) {
    const plan = await this.findById(id);

    return await this.prisma.workoutPlan.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : plan.date },
    });
  }

  async delete(id: number) {
    const plan = await this.findById(id);

    const data = await this.prisma.workoutPlan.delete({ where: { id } });
    return {
      message: `Đã xóa lịch tập id ${id}`,
    };
  }
}
