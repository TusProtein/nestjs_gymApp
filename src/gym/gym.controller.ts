import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '~/common/decorator/roles.decorator';
import { JwtAuthGuard } from '~/common/guard/jwt-auth.guard';
import { RolesGuard } from '~/common/guard/roles.guard';
import { AssignAdminDto } from './dto/assign-admin.dto';
import { CreateGymDto } from './dto/create-gym.dto';
import { SuperAdminCreateAdminDto } from './dto/super-admin-create-admin.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymService } from './gym.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('gym')
export class GymController {
  constructor(private readonly gymService: GymService) {}

  @Get('get-all-with-stats')
  getAllWithStats() {
    return this.gymService.findAllWithStats();
  }

  @Get(':id/get-users-by-gym')
  getUsersByGym(
    @Param('id', ParseIntPipe) id: number,
    @Query('role') role?: UserRole,
  ) {
    return this.gymService.getUsersByGym(id, role);
  }

  @Post()
  create(@Body() dto: CreateGymDto) {
    return this.gymService.create(dto);
  }

  @Get()
  findAll() {
    return this.gymService.findAll();
  }

  @Get(':id')
  findbyId(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGymDto) {
    return this.gymService.update(id, dto);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.restore(id);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.disable(id);
  }
  @Delete(':id')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.hardDelete(id);
  }

  @Post(':id/create-admin-by-super-admin')
  createAdminForGym(
    @Param('id', ParseIntPipe) gymId: number,
    @Body() dto: SuperAdminCreateAdminDto,
  ) {
    return this.gymService.createAdminForGym(gymId, dto);
  }

  @Patch(':id/assign-admin')
  assignAdmin(
    @Param('id', ParseIntPipe) gymId: number,
    @Body() dto: AssignAdminDto,
  ) {
    return this.gymService.assignExistingUserAsAdmin(gymId, dto.adminId);
  }
}
