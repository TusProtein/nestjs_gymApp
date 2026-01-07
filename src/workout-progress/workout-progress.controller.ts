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
import { WorkoutProgressService } from './workout-progress.service';
import { CreateWorkoutProgressDto } from './dto/create-workout-progress.dto';
import { UpdateWorkoutProgressDto } from './dto/update-workout-progress.dto';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';
import { Roles } from '~/common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PT)
@Controller('workout-progress')
// 1 MEMBER - 1 PT - 1 DATE = 1 WORKOUT_PROGRESS
export class WorkoutProgressController {
  constructor(
    private readonly workoutProgressService: WorkoutProgressService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateWorkoutProgressDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workoutProgressService.create(dto, req.user.id, req.user.gymId);
  }
  @Roles(UserRole.ADMIN, UserRole.PT)
  @Get('member/:id')
  findByMember(
    @Param('id', ParseIntPipe) memberId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workoutProgressService.findByMember(memberId, req.user);
  }

  @Roles(UserRole.MEMBER)
  @Get('me')
  findMyProgress(@Req() req: AuthenticatedRequest) {
    return this.workoutProgressService.findMyProgress(req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkoutProgressDto: UpdateWorkoutProgressDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workoutProgressService.update(
      id,
      updateWorkoutProgressDto,
      req.user,
    );
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workoutProgressService.delete(id, req.user);
  }
}
