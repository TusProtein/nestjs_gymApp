import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus, UserRole } from '@prisma/client';
import { addDays, differenceInDays } from 'date-fns';
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
  async registerPlan(
    memberId: number,
    planId: number,
    gymId: number,
    ptId?: number,
  ) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new BadRequestException('Gói tập không có sẵn');
    }

    const [duplicate, active] = await Promise.all([
      this.prisma.userMembership.findFirst({
        where: {
          memberId,
          planId,
          endDate: { gt: new Date() },
        },
      }),
      this.prisma.userMembership.findFirst({
        where: {
          memberId,
          isActive: true,
          paymentStatus: PaymentStatus.PAID,
          endDate: { gt: new Date() },
        },
      }),
    ]);

    if (duplicate)
      throw new BadRequestException('Người dùng đã đăng ký gói này trước đó');

    if (active)
      throw new BadRequestException(
        'Người dùng đã có một gói tập đang hoạt động',
      );

    // Tìm các PT có sẵn trong gym
    const user = await this.prisma.user.findUnique({
      where: { id: memberId },
      include: { gym: true },
    });

    if (!user || !user.gymId)
      throw new BadRequestException('Người dùng chưa thuộc phòng gym nào');

    let assignedPtId = ptId;

    if (ptId) {
      const pt = await this.prisma.user.findUnique({ where: { id: ptId } });

      if (!pt || pt.role !== UserRole.PT || pt.gymId !== user.gymId) {
        throw new BadRequestException('PT không hợp lệ hoặc không cùng gym');
      }
    } else {
      const availablePts = await this.prisma.user.findMany({
        where: { gymId: user.gymId, role: UserRole.PT },
      });

      if (availablePts.length === 0) {
        throw new BadRequestException(
          'Không có PT nào khả dụng trong phòng gym',
        );
      }
      const randomPt =
        availablePts[Math.floor(Math.random() * availablePts.length)];

      assignedPtId = randomPt.id;
    }

    const startDate = new Date();
    const endDate = addDays(startDate, plan.durationInDays);

    const finalPrice = plan.discount
      ? Number(plan.price) * (1 - plan.discount / 100)
      : Number(plan.price);

    const membership = await this.prisma.userMembership.create({
      data: {
        memberId,
        planId,
        ptId: assignedPtId,
        startDate,
        endDate,
        finalPrice,
        paymentStatus: PaymentStatus.PAID, // giả lập thanh toán
        isActive: true,
      },
      include: {
        plan: true,
        pt: { select: { id: true, name: true } },
      },
    });

    await this.prisma.subcription.create({
      data: {
        memberId,
        planId,
        gymId,
        totalPrice: finalPrice,
        startDate,
        endDate,
      },
    });

    return {
      message: 'Đăng ký gói tập thành công',
      data: membership,
    };
  }

  //  Lấy dsach gói mà user đã đăng ký
  async findByUser(memberId: number) {
    return this.prisma.userMembership.findMany({
      where: { memberId },
      include: {
        member: { select: { name: true } },
        plan: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
    const validStatuses = Object.values(PaymentStatus);

    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestException('Invalid payment status');
    }

    return this.prisma.userMembership.update({
      where: { id },
      data: { paymentStatus },
      include: {
        member: true,
        plan: true,
      },
    });
  }

  // Láy các gói tập còn hoạt động của user
  async getActiveUsers(gymId: number, memberId: number, role: UserRole) {
    const now = new Date();

    const whereConditons: any = {
      isActive: true,
      paymentStatus: PaymentStatus.PAID,
      endDate: { gt: now },
    };

    if (role === UserRole.PT) {
      whereConditons.ptId = memberId;
    }

    if (role === UserRole.ADMIN) {
      whereConditons.user = { gymId };
    }

    const memberships = await this.prisma.userMembership.findMany({
      where: whereConditons,
      include: {
        member: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true } },
        pt: { select: { id: true, name: true } },
      },
      orderBy: { endDate: 'asc' },
    });

    if (memberships.length === 0)
      throw new NotFoundException('Không tìm thấy gói tập đang hoạt động nào');

    return memberships.map((m) => ({
      memberId: m?.member?.id,
      userName: m?.member?.name,
      planName: m.plan.name,
      ptName: m.pt?.name ?? 'Chưa có PT',
      startDate: m.startDate,
      endDate: m.endDate,
      daysLeft: differenceInDays(m.endDate, now),
    }));
  }
}
