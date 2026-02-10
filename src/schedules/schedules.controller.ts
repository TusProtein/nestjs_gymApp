import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';
import { Roles } from '~/common/decorator/roles.decorator';
import { UserRole, Weekday } from '@prisma/client';
import { AvailablePtDto } from './dto/available-pt.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}
  @Roles(UserRole.ADMIN, UserRole.PT)
  @Post()
  create(@Body() dto: CreateScheduleDto, @Req() req: AuthenticatedRequest) {
    return this.schedulesService.createSchedule(dto, req.user);
  }
  @Roles(UserRole.PT)
  @Post('day-off-pt')
  setDayOff(@Body() weekdays: Weekday[], @Req() req: AuthenticatedRequest) {
    return this.schedulesService.setPtDayOff(req.user.id, weekdays);
  }

  // Xem lịch PT trống
  @Roles(UserRole.MEMBER)
  @Post('available-pts')
  getAvailablePts(
    @Body() dto: AvailablePtDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.schedulesService.getAvailablePts(dto, req.user);
  }

  // Member đặt lịch
  @Roles(UserRole.MEMBER)
  @Post('book')
  book(@Body() dto: CreateScheduleDto, @Req() req: AuthenticatedRequest) {
    return this.schedulesService.createSchedule(dto, req.user);
  }

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get('pt')
  findByPt(@Req() req: AuthenticatedRequest) {
    return this.schedulesService.findByPt(req.user.id);
  }

  @Get('me')
  findByMember(@Req() req: AuthenticatedRequest) {
    return this.schedulesService.findByMember(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.schedulesService.update(id, dto, req.user);
  }

  @Post('cancel/:scheduleId')
  cancelSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.schedulesService.cancelSchedule(scheduleId, req.user);
  }

  @Post('complete/:scheduleId')
  completeSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.schedulesService.completeSchedule(scheduleId, req.user);
  }

  // @Post()
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number) {
  //   await this.schedulesService.remove(id);

  //   return {
  //     message: 'Lich tập đã được xóa thành công',
  //   };
  // }
}
