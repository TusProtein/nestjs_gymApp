import { Module } from '@nestjs/common';
import { WorkoutProgressService } from './workout-progress.service';
import { WorkoutProgressController } from './workout-progress.controller';

@Module({
  controllers: [WorkoutProgressController],
  providers: [WorkoutProgressService],
})
export class WorkoutProgressModule {}
