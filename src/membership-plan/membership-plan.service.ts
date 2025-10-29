import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembershipPlanService {
  constructor(private prisma: PrismaService) {}

  async findPlan(id: number, gymId: number) {
    const plan = await this.prisma.membershipPlan.findFirst({
      where: { id, gymId },
    });
    if (!plan) throw new NotFoundException('Không tìm thấy gói tập này');
    return plan;
  }
  async create(dto: CreateMembershipPlanDto, gymId: number) {
    const exist = await this.prisma.membershipPlan.findFirst({
      where: { name: dto.name, gymId },
    });
    if (exist) throw new BadRequestException('Tên gói tập này đã tồn tại');

    const plan = await this.prisma.membershipPlan.create({
      data: { ...dto, gymId },
    });

    return {
      message: 'Tạo gói tập thành công',
      plan,
    };
  }

  // Member + Admin xem gói tập
  async findAll(gymId: number) {
    const plans = await this.prisma.membershipPlan.findMany({
      where: { isActive: true, gymId },
    });

    if (plans.length === 0) {
      throw new NotFoundException('Chưa có gói tập nào khả dụng trong gym');
    }

    return plans;
  }

  async update(
    id: number,
    updateMembershipPlanDto: UpdateMembershipPlanDto,
    gymId: number,
  ) {
    await this.findPlan(id, gymId);

    const updatedPlan = await this.prisma.membershipPlan.update({
      where: { id },
      data: updateMembershipPlanDto,
    });

    return {
      message: 'Gói tập đã được cập nhật',
      data: updatedPlan,
    };
  }

  async disable(id: number, gymId: number) {
    await this.findPlan(id, gymId);

    const disabledPlan = await this.prisma.membershipPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Gói tập đã được ẩn',
      data: disabledPlan,
    };
  }
}
