import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserMembershipDto } from './dto/register-user-membership.dto';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { UserMembershipService } from './user-membership.service';
import { RolesGuard } from '~/common/guard/roles.guard';
import { Roles } from '~/common/decorator/roles.decorator';
import { PaymentStatus, UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user-membership')
export class UserMembershipController {
  constructor(private readonly userMembershipService: UserMembershipService) {}

  @Roles(UserRole.MEMBER)
  @Post()
  registerPlan(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RegisterUserMembershipDto,
  ) {
    const memberId = req.user.id;
    const gymId = Number(req.user.gymId);
    return this.userMembershipService.registerPlan(
      memberId,
      dto.planId,
      gymId,
      dto.ptId,
    );
  }

  //// Member tự lấy danh sách gói tập của chính mình
  @Roles(UserRole.MEMBER)
  @Get('me')
  findMyMemberships(@Req() req: AuthenticatedRequest) {
    return this.userMembershipService.findByUser(req.user.id);
  }

  // Admin lấy danh sách gói tập của khách hàng
  @Roles(UserRole.ADMIN)
  @Get(':memberId')
  findByUser(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.userMembershipService.findByUser(memberId);
  }

  // Admin update paymentStatus
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.userMembershipService.updatePaymentStatus(id, paymentStatus);
  }

  @Roles(UserRole.ADMIN, UserRole.PT)
  @Get('users/active')
  getActiveUsers(@Req() req: AuthenticatedRequest) {
    const { id: memberId, gymId, role } = req.user;
    return this.userMembershipService.getActiveUsers(gymId, memberId, role);
  }
}
