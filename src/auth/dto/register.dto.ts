import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsString({ message: 'First name must be a string' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    lastName: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}
