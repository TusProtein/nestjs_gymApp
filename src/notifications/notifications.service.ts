import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { JwtPayload } from '~/auth/jwt-payload.interface';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendScheduleReminderTx(
    tx: Prisma.TransactionClient,
    params: {
      memberId: number;
      memberName: string;
      ptId: number;
      ptName: string;
      startTime: Date;
    },
  ) {
    const time = format(
      toZonedTime(params.startTime, 'Asia/Ho_Chi_Minh'),
      'HH:mm',
    );

    // Lưu DB (in-app notification)
    // Member
    await tx.notification.create({
      data: {
        userId: params.memberId,
        title: '⏰ Nhắc lịch tập',
        body: `Xin chào ${params.memberName}, bạn có lịch tập lúc ${time} hôm nay với PT ${params.ptName} đấy nhaa.`,
        type: NotificationType.REMINDER,
      },
    });

    // PT
    await tx.notification.create({
      data: {
        userId: params.ptId,
        title: '⏰ Nhắc lịch huấn luyện',
        body: `Bạn có lịch dạy lúc ${time} hôm nay với học viên ${params.memberName}.`,
        type: NotificationType.REMINDER,
      },
    });
  }

  async getUserNotifications(user: JwtPayload) {
    return this.prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Đánh đấu 1 noti là đã đọc
  async markAsRead(notificationId: number, user: JwtPayload) {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    if (result.count === 0)
      throw new NotFoundException('Thông báo không tồn tại hoặc đã được đọc');

    return {
      message: 'Đánh dấu là đã đọc',
    };
  }

  // Đếm số noti chưa đọc (badge)
  async getUnreadCount(user: JwtPayload) {
    const count = await this.prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return { count };
  }

  // Đánh dấu tất cả noti là đã đọc
  async markAllAsRead(user: JwtPayload) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      updatedCount: result.count,
    };
  }
}
