import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { Event, EventSchema } from './Schemas/events.schema';
import { Event, EventSchema } from './schemas/events.schema';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { TokenService } from 'src/common/utils/token.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsService, JwtStrategy, TokenService],
  exports: [EventsService],
})
export class EventsModule {}
