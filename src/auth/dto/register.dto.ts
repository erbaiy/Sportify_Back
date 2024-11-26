import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)

  @IsString()
  firstName: string;

  @IsString()
  lastfName: string;

  @IsString()
  password: string;


};

