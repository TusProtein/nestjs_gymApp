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

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
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
  ) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.schedulesService.remove(id);

    return {
      message: 'Lich tập đã được xóa thành công',
    };
  }
}
