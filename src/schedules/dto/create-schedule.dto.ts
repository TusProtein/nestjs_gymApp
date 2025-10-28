import { IsDateString, IsInt } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  ptId!: number;

  @IsInt()
  memberId!: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}
