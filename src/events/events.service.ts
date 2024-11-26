import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/events.shclema';


@Injectable()
export class EventsService {
    constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

     
}