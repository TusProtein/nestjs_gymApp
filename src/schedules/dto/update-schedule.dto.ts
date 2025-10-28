import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
