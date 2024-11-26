import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/events.shclema';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
    ],
    controllers: [EventsController],
    providers: [EventsService],
    exports: [EventsService],
})
export  class EventsModule {}