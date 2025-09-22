import { UserRole } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class BaseUserDto {
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone!: string;

  @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng ISO' })
  dateOfBirth!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
