import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWorkoutProgressDto {
  @IsInt()
  memberId!: number;

  // @IsInt()
  // ptId!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  muscleMass?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  performance?: any; // JSON obj
}
