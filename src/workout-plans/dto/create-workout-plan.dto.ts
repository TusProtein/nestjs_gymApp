import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateWorkoutPlanDto {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  content!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  memberId!: number;
}
