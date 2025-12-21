import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  workspaceName!: string;
}
