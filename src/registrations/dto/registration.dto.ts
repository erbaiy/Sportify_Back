import { IsNotEmpty, IsString, IsEmail, IsMongoId, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
    @IsNotEmpty()
    @IsMongoId()
    event: string;

    @IsNotEmpty()
    @IsString()
    participantName: string;

    @IsNotEmpty()
    @IsEmail()
    participantEmail: string;

    

    @IsOptional()
    status?: string;
            

 
}
