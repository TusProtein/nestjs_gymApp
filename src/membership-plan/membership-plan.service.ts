import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembershipPlanService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateMembershipPlanDto) {
    const exist = await this.prisma.membershipPlan.findUnique({
      where: { name: dto.name },
    });
    if (exist) throw new BadRequestException('Tên gói tập này đã tồn tại');
    const plan = await this.prisma.membershipPlan.create({ data: dto });

    return {
      message: 'Tạo gói tập thành công',
      plan,
    };
  }

  // Member + Admin xem gói tập
  findAll() {
    return this.prisma.membershipPlan.findMany({ where: { isActive: true } });
  }

  async update(id: number, updateMembershipPlanDto: UpdateMembershipPlanDto) {
    const plan = await this.prisma.membershipPlan.update({
      where: { id },
      data: updateMembershipPlanDto,
    });

    return {
      message: 'Gói tập đã được cập nhật',
      plan,
    };
  }

  async disable(id: number) {
    const plan = await this.prisma.membershipPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Gói tập đã được ẩn',
      plan,
    };
  }
}
