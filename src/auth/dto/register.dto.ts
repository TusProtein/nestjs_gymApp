import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { BaseUserDto } from '~/common/dto/base-user.dto';
import { Match } from '../../common/decorator/match.decorator';

export class registerDto extends BaseUserDto {
  @IsString()
  @MinLength(4, { message: 'Mật khẩu phải có ít nhất 4 ký tự' })
  @MaxLength(20, { message: 'Mật khẩu không được dài quá 20 ký tự' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu quá yếu',
  })
  password!: string;

  @IsString()
  @Match('password', { message: 'Nhập lại mật khẩu không đúng' })
  passwordConfirm!: string;
}
