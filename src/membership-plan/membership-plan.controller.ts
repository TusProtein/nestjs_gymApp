import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { MembershipPlanService } from './membership-plan.service';
import { Roles } from '~/common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';

@Controller('membership-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MembershipPlanController {
  constructor(private memberPlanService: MembershipPlanService) {}

  @Post()
  create(
    @Body() dto: CreateMembershipPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.memberPlanService.create(dto, req.user.gymId);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.memberPlanService.findAll(req.user.gymId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMembershipPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.memberPlanService.update(id, dto, req.user.gymId);
  }

  @Patch(':id/disable')
  disable(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.memberPlanService.disable(id, req.user.gymId);
  }
}
