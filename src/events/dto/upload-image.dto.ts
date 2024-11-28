import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty()
  eventId: string;
}