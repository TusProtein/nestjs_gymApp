import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsOptional()
  @IsInt()
  ptId?: number;

  @IsOptional()
  @IsInt()
  memberId?: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}
