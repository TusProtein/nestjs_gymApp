import { IsNotEmpty } from 'class-validator';
import { BaseUserDto } from '~/common/dto/base-user.dto';

export class CreateUserDto extends BaseUserDto {
  @IsNotEmpty()
  password!: string;
}
