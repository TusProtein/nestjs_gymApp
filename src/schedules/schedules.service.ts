import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}
  //Admin or PT
  async create(dto: CreateScheduleDto) {
    const { ptId, memberId, startTime, endTime } = dto;

    // Check pt conflict
    const ptConflict = await this.prisma.schedule.findFirst({
      where: {
        ptId,
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });
    if (ptConflict)
      throw new BadRequestException('PT đã có lịch trong khung giờ này.');

    const memberConflict = await this.prisma.schedule.findFirst({
      where: {
        memberId,
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });

    if (memberConflict)
      throw new BadRequestException('Học viên đã có lịch trong khung giờ này.');

    const schedule = await this.prisma.schedule.create({
      data: {
        ptId,
        memberId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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

  async update(id: number, dto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) throw new NotFoundException('Lịch tập không tồn tại');

    return this.prisma.schedule.update({
      where: { id },
      data: dto,
      include: {
        pt: true,
        member: true,
      },
    });
  }

  async remove(id: number) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new BadRequestException('Lịch tập không tồn tại');

    return this.prisma.schedule.delete({ where: { id } });
  }
}
