import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { MembershipPlanService } from './membership-plan.service';
import { Roles } from '~/common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';

@Controller('membership-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MembershipPlanController {
  constructor(private memberPlanService: MembershipPlanService) {}

  @Post()
  create(@Body() dto: CreateMembershipPlanDto) {
    return this.memberPlanService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findAll() {
    return this.memberPlanService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMembershipPlanDto,
  ) {
    return this.memberPlanService.update(id, dto);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.memberPlanService.disable(id);
  }
}
