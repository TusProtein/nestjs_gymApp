import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus } from '@prisma/client';
import { addDays } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserMembershipService {
  // Log userMembership expired
  private readonly logger = new Logger(UserMembershipService.name);

  constructor(private prisma: PrismaService) {}
  // Cron job: chạy 1 lần mỗi ngày lúc 0h
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deactivExpiredMemberships() {
    this.logger.debug('Running job: Vô hiệu hóa gói tập hết hạn');

    const result = await this.prisma.userMembership.updateMany({
      where: {
        endDate: { lt: new Date() }, // expired
        isActive: true,
      },
      data: { isActive: false },
    });

    this.logger.debug(`Vô hiệu hóa ${result.count} user memberships`);
  }
  async registerPlan(userId: number, planId: number) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new BadRequestException('Gói tập không có sẵn');
    }

    const duplicate = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        planId,
        endDate: { gt: new Date() },
      },
    });

    if (duplicate)
      throw new BadRequestException('Người dùng đã đăng ký gói này trước đó');

    const active = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        isActive: true,
        paymentStatus: PaymentStatus.PAID,
        endDate: { gt: new Date() },
      },
    });

    if (active)
      throw new BadRequestException(
        'Người dùng đã có một gói tập đang hoạt động',
      );

    const startDate = new Date();
    const endDate = addDays(startDate, plan.durationInDays);

    const finalPrice = plan.discount
      ? Number(plan.price) * (1 - plan.discount / 100)
      : Number(plan.price);

    return this.prisma.userMembership.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        finalPrice,
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

  updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
    const validStatuses = ['PENDING', 'PAID', 'CANCELLED'];

    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestException('Invalid payment status');
    }

    return this.prisma.userMembership.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: true,
        plan: true,
      },
    });
  }
}
