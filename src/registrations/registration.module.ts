import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { RegistrationSchema } from './schemas/registration.schema'; // Update this path to your schema
// import { EventSchema } from 'src/events/Schemas/events.schema';
import { EventSchema } from '../events/schemas/events.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Registration', schema: RegistrationSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
