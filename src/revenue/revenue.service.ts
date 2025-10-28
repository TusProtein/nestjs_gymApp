import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { endOfMonth, startOfMonth } from 'date-fns';

@Injectable()
export class RevenueService {
  constructor(private prisma: PrismaService) {}
  async getRevenue(gymId: number, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const start = startOfMonth(new Date(targetYear, targetMonth - 1));
    const end = endOfMonth(new Date(targetYear, targetMonth - 1));

    const subcriptions = await this.prisma.subcription.aggregate({
      where: {
        gymId,
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    });

    return {
      month: targetMonth,
      year: targetYear,
      totalRevenue: subcriptions._sum.totalPrice,
      count: subcriptions._count.id,
    };
  }

  // Get doanh thu từ các gói tập
  async getRevenueByPlan(gymId: number) {
    const stats = await this.prisma.subcription.groupBy({
      by: ['planId'],
      where: { gymId },
      _sum: { totalPrice: true },
      _count: { id: true },
    });

    return stats.map((item) => ({
      planId: item.planId,
      totalRevenue: item._sum.totalPrice ?? 0,
      totalSubscription: item._count.id,
    }));
  }
}
