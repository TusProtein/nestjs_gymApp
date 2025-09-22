import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';
import { Roles } from '~/common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';

@Controller('workout-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PT)
export class WorkoutPlansController {
  constructor(private readonly workoutPlanService: WorkoutPlansService) {}
  // Member xem lich tap ca nhan
  @Roles(UserRole.ADMIN, UserRole.PT, UserRole.MEMBER)
  @Get('member/:memberId')
  getPlansByMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    // Member chỉ xem đượcl lịch tập chính mình
    if (user.role === UserRole.MEMBER && user.id !== memberId) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    return this.workoutPlanService.findByMember(memberId);
  }

  @Post()
  createPlans(
    @Body() dto: CreateWorkoutPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ptId = req.user.id;

    return this.workoutPlanService.create(dto, ptId);
  }

  @Patch(':id')
  async updatePlans(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkoutPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    // nếu là PT: đảm bảo PT sở hữu plan
    if (user.role === UserRole.PT) {
      const plan = await this.workoutPlanService.findById(id);
      if (plan.ptId !== user.id) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa lịch tập này',
        );
      }
    }
    return this.workoutPlanService.update(id, dto);
  }

  @Delete(':id')
  async deletePlans(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (user.role === UserRole.PT) {
      const plan = await this.workoutPlanService.findById(id);
      if (plan.ptId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền xóa lịch tập này');
      }
    }
    return this.workoutPlanService.delete(id);
  }
}
