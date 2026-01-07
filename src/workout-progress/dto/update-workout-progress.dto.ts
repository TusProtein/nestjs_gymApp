import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutProgressDto } from './create-workout-progress.dto';

export class UpdateWorkoutProgressDto extends PartialType(CreateWorkoutProgressDto) {}
