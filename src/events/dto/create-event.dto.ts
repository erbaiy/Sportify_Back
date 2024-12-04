import { IsString, IsDate, IsOptional, IsNumber, IsEnum, MinLength, IsMongoId, IsNotEmpty, isNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)

  title: string;
  @IsOptional()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @IsDate()
  @Type(() => Date)
  registrationDeadline: Date;



  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: string = 'upcoming';
}
