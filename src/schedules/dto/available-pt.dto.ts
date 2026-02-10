import { IsDateString } from 'class-validator';

export class AvailablePtDto {
  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;
}
