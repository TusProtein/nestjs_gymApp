import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { UpdateUserMembershipDto } from './dto/update-user-membership.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from 'date-fns';
import { RegisterUserMembershipDto } from './dto/register-user-membership.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class UserMembershipService {
  constructor(private prisma: PrismaService) {}
  async registerPlan(userId: number, planId: number) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new BadRequestException('Gói tập không có sẵn');
    }

    const active = await this.prisma.userMembership.findFirst({
      where: { userId, isActive: true, endDate: { gt: new Date() } },
    });

    if (active)
      throw new BadRequestException(
        'Người dùng đã có một gói tập đang hoạt động',
      );

    const startDate = new Date();
    const endDate = addDays(startDate, plan.durationInDays);

    return this.prisma.userMembership.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        paymentStatus: PaymentStatus.PAID, // giả lập thanh toán
        isActive: true,
      },
    });
  }

  //  Lấy dsach gói mà user đã đăng ký
  async findByUser(userId: number) {
    return this.prisma.userMembership.findMany({
      where: { userId },
      include: {
        user: { select: { name: true } },
        plan: true,
      },
    });
  }
}
