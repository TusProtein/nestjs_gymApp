import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleStatus, UserRole, Weekday } from '@prisma/client';
import { JwtPayload } from '~/auth/jwt-payload.interface';
import { getWeekday, toUtc } from '~/common/utils/date';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailablePtDto } from './dto/available-pt.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '~/notifications/notifications.service';

const WEEKDAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}
  async assertScheduleCanBeModified(scheduleId: number, user: JwtPayload) {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        OR: [
          {
            pt: {
              id: user.id,
              gymId: user.gymId,
            },
          },
          {
            member: {
              id: user.id,
              gymId: user.gymId,
            },
          },
        ],
      },
    });

    if (!schedule) throw new NotFoundException('Không tìm thấy lịch tập');

    if (schedule.status === 'CANCELLED')
      throw new BadRequestException('Lịch đã bị hủy');

    if (schedule.status === 'COMPLETED')
      throw new BadRequestException('Buổi tập đã hoàn thành');

    const now = new Date();

    if (schedule.startTime <= now)
      throw new BadRequestException('Không thể cập nhật lịch đã diễn ra');

    const diffMs = schedule.startTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1)
      throw new BadRequestException(
        'Chỉ được hủy trước giờ tập ít nhất 1 tiếng',
      );

    return schedule;
  }

  async createSchedule(dto: CreateScheduleDto, user: JwtPayload) {
    const { startTime, endTime } = dto;

    const ptId = user.role === UserRole.PT ? user.id : dto.ptId;
    const memberId = user.role === UserRole.MEMBER ? user.id : dto.memberId;

    if (!ptId) throw new BadRequestException('PtId là bắt buộc');
    if (!memberId) throw new BadRequestException('MemberId là bắt buộc');

    const [pt, member] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: ptId,
          role: UserRole.PT,
          gymId: user.gymId,
        },
      }),
      this.prisma.user.findFirst({
        where: {
          id: memberId,
          role: UserRole.MEMBER,
          gymId: user.gymId,
        },
      }),
    ]);

    if (!pt) throw new BadRequestException('PT không thuộc gym này');

    if (!member) throw new BadRequestException('Học viên không thuộc gym này');

    const now = new Date();
    const startUtc = toUtc(startTime);
    const endUtc = toUtc(endTime);

    if (startUtc <= now)
      throw new BadRequestException(
        'Không thể tạo lịch ở thời điểm đã diễn ra hoặc hiện tại',
      );

    if (endUtc <= startUtc)
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );

    const weekday = getWeekday(startUtc);

    // Check PT nghỉ
    const ptDayOff = await this.prisma.ptDayOff.findFirst({
      where: {
        ptId,
        weekday,
      },
    });
    if (ptDayOff)
      throw new BadRequestException(
        'PT nghỉ ngày này, vui lòng chọn ngày khác',
      );

    // Check pt conflict
    const ptConflict = await this.prisma.schedule.findFirst({
      where: {
        ptId,
        status: ScheduleStatus.BOOKED,
        startTime: { lt: endUtc },
        endTime: { gt: startUtc },
      },
    });
    if (ptConflict)
      throw new BadRequestException('PT đã có lịch trong khung giờ này');

    const memberConflict = await this.prisma.schedule.findFirst({
      where: {
        memberId,
        status: ScheduleStatus.BOOKED,
        startTime: { lt: endUtc },
        endTime: { gt: startUtc },
      },
    });

    if (memberConflict)
      throw new BadRequestException('Học viên đã có lịch trong khung giờ này.');

    const schedule = await this.prisma.schedule.create({
      data: {
        ptId,
        memberId,
        startTime: startUtc,
        endTime: endUtc,
        status: ScheduleStatus.BOOKED,
      },
      include: {
        pt: true,
        member: true,
      },
    });

    return {
      message: 'Tạo lịch tập thành công',
      data: schedule,
    };
  }

  async setPtDayOff(ptId: number, weekdays: Weekday[]) {
    await this.prisma.ptDayOff.deleteMany({ where: { ptId } });

    await this.prisma.ptDayOff.createMany({
      data: weekdays.map((w) => ({ ptId, weekday: w })),
    });

    return {
      message: 'Cập nhật ngày nghỉ thành công',
    };
  }

  async getAvailablePts(dto: AvailablePtDto, user: JwtPayload) {
    const startUtc = toUtc(dto.startAt);
    const endUtc = toUtc(dto.endAt);

    const weekday = getWeekday(startUtc);

    return this.prisma.user.findMany({
      where: {
        role: UserRole.PT,
        gymId: user.gymId,
        // PT nghỉ ngày này
        ptDayOffAsPT: { none: { weekday } },
        // PT đã có lịch trùng giờ
        scheduleAsPT: {
          none: {
            status: ScheduleStatus.BOOKED,
            startTime: { lt: endUtc },
            endTime: { gt: startUtc },
          },
        },
      },
      select: {
        id: true,
        name: true,
        gymId: true,
      },
    });
  }

  // Lấy toàn bộ lịch (Admin)
  findAll() {
    return this.prisma.schedule.findMany({
      include: {
        pt: true,
        member: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findByPt(ptId: number) {
    return this.prisma.schedule.findMany({
      where: { ptId },
      include: { member: true },
      orderBy: { startTime: 'asc' },
    });
  }

  findByMember(memberId: number) {
    return this.prisma.schedule.findMany({
      where: { memberId },
      include: { pt: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async update(id: number, dto: UpdateScheduleDto, user: JwtPayload) {
    const now = new Date();
    const { startTime, endTime } = dto;
    const schedule = await this.assertScheduleCanBeModified(id, user);

    // Tính giờ mới
    const newStart = startTime ? new Date(startTime) : schedule.startTime;

    const newEnd = endTime ? new Date(endTime) : schedule.endTime;

    if (newStart > newEnd)
      throw new BadRequestException('Thời gian không hợp lệ');

    if (newStart <= now)
      throw new BadRequestException(
        'Không thể cập nhật lịch về thời điểm đã diễn ra hoặc hiện tại',
      );
    // Check PT conflict (trừ chính lịch này)
    const ptConflict = await this.prisma.schedule.findFirst({
      where: {
        id: { not: schedule.id },
        ptId: schedule.ptId,
        status: ScheduleStatus.BOOKED,
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    });

    if (ptConflict)
      throw new BadRequestException('PT đã có lịch trong khung giờ này');

    // Check member conflict
    const memberConflict = await this.prisma.schedule.findFirst({
      where: {
        id: { not: schedule.id },
        memberId: schedule.memberId,
        status: ScheduleStatus.BOOKED,
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    });

    if (memberConflict)
      throw new BadRequestException('Học viên đã có lịch trong khung giờ này');

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        startTime: newStart,
        endTime: newEnd,
      },
      include: {
        pt: true,
        member: true,
      },
    });

    return {
      message: 'Cập nhật lịch tập thành công',
      data: updated,
    };
  }

  // UC09
  @Cron('*/5 * * * *')
  async remindUpcomingSchedules() {
    const now = new Date();
    const from = new Date(now.getTime() + 55 * 60 * 1000);
    const to = new Date(now.getTime() + 60 * 60 * 1000);

    const schedules = await this.prisma.schedule.findMany({
      where: {
        status: ScheduleStatus.BOOKED,
        reminderSent: false,
        startTime: {
          gte: from,
          lte: to,
        },
      },
      include: {
        pt: true,
        member: true,
      },
    });

    for (const s of schedules) {
      await this.prisma.$transaction(async (tx) => {
        await this.notificationService.sendScheduleReminderTx(tx, {
          memberId: s.memberId,
          memberName: s.member.name,
          ptId: s.ptId,
          ptName: s.pt.name,
          startTime: s.startTime,
        });

        await tx.schedule.update({
          where: { id: s.id },
          data: {
            reminderSent: true,
            reminderSentAt: new Date(),
          },
        });
      });

      console.log(`[CRON] Sent reminder for schedule ${s.id}`);
    }
  }

  async cancelSchedule(scheduleId: number, user: JwtPayload) {
    const schedule = await this.assertScheduleCanBeModified(scheduleId, user);

    const updated = await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CANCELLED',
        cancelledBy: user.role,
        cancelledAt: new Date(),
      },
    });

    return {
      message: 'Hủy lịch tập thành công',
      data: updated,
    };
  }

  async completeSchedule(scheduleId: number, user: JwtPayload) {
    if (user.role !== UserRole.PT)
      throw new ForbiddenException('Chỉ PT được xác nhận hoàn thành buổi tập');

    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        pt: {
          id: user.id,
          gymId: user.gymId,
        },
      },
    });

    if (!schedule) throw new NotFoundException('Không tìm thấy lịch tập');

    if (schedule.status !== 'BOOKED')
      throw new BadRequestException('Lịch ở trạng thái không hợp lệ');

    const now = new Date();
    if (now < schedule.endTime)
      throw new BadRequestException(
        'Chỉ được xác nhận sau khi buổi tập kết thúc',
      );

    const updated = await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      message: 'Xác nhận hoàn thành buổi tập',
      data: updated,
    };
  }

  // async remove(id: number) {
  //   const schedule = await this.prisma.schedule.findUnique({ where: { id } });
  //   if (!schedule) throw new BadRequestException('Lịch tập không tồn tại');

  //   return this.prisma.schedule.delete({ where: { id } });
  // }
}
