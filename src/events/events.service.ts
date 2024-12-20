import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { Event, EventDocument } from './Schemas/events.schema';

import * as fs from 'fs';
import * as path from 'path';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './schemas/events.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    organizer: string,
  ): Promise<Event> {
    try {
      if (typeof createEventDto.maxParticipants === 'string') {
        createEventDto.maxParticipants = parseInt(
          createEventDto.maxParticipants,
          10,
        );
      }
      const isTitleExist = await this.eventModel.findOne({
        title: createEventDto.title,
      });
      if (isTitleExist) {
        throw new HttpException(
          `Event with title ${createEventDto.title} already exists`,
          400,
        );
      } else if (new Date(createEventDto.date) < new Date()) {
        throw new HttpException('Event date cannot be in the past', 400);
      } else if (
        new Date(createEventDto.registrationDeadline) >
        new Date(createEventDto.date)
      ) {
        throw new HttpException(
          'Registration deadline cannot be after the event date',
          400,
        );
      }

      const newEvent = new this.eventModel({ ...createEventDto, organizer });

      return await newEvent.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(`Error creating event: ${error.message}`);
    }
  }


  async findAll(query: any): Promise<Event[]> {
    return this.eventModel.find(query).exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new HttpException(`Event with ID ${id} not found`, 404);
    }
    return event;
  }
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const existingEvent = await this.eventModel.findById(id);

    if (!existingEvent) {
      throw new HttpException(`Event with ID ${id} not found`, 404); // Already throwing 404
    }

    if (updateEventDto.image && existingEvent.image) {
      // Delete old image
      const oldImagePath = path.join('uploads', existingEvent.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the event with the new data
    return this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Event> {
    try {
      const event = await this.eventModel.findById(id);
      console.log(event);

      if (event === null) {
        throw new HttpException(`Event with ID ${id} not found`, 404);
      }

      if (event.image) {
        // Delete image file
        const imagePath = path.join('uploads', event.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      return this.eventModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw error;
    }
  }
}
