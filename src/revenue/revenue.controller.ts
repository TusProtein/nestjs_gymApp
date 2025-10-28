import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RevenueService } from './revenue.service';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';

@Controller('revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  getRevenue(
    @Req() req: AuthenticatedRequest,
    @Query('month', ParseIntPipe) month?: number,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    const admin = req.user;
    return this.revenueService.getRevenue(Number(admin.gymId), month, year);
  }

  // Revenue từ planId
  @Get('by-plan')
  getRevenueByPlan(@Req() req: AuthenticatedRequest) {
    const admin = req.user;
    return this.revenueService.getRevenueByPlan(Number(admin.gymId));
  }
}
