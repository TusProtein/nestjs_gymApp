import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGymDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
