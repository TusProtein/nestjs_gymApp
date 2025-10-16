import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MembershipPlanModule } from './membership-plan/membership-plan.module';
import { UserMembershipModule } from './user-membership/user-membership.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GymModule } from './gym/gym.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), //  bật cron jobs
    AuthModule,
    UserModule,
    WorkoutPlansModule,
    MembershipPlanModule,
    UserMembershipModule,
    GymModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
