import { IsAlphanumeric, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @Matches(/^[가-힣a-zA-Z \s]+$/)
  @IsNotEmpty()
  readonly realName: string;
}
