import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Registration } from './Schema/registration.schema';
import { CreateRegistrationDto } from './dto/registration.dto';
// import { Event } from 'src/events/schemas/events.schema';
import { Event } from '../events/schemas/events.schema';


@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}


  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    try {
      const { event: eventId, participantEmail } = createRegistrationDto;
      const eventObjectId = new mongoose.Types.ObjectId(eventId);

      // Check if event exists
      const event = await this.eventModel.findById(eventObjectId).exec();
      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }

      // Check for existing registration
      const existingRegistration = await this.registrationModel
        .findOne({
          event: eventObjectId,
          participantEmail: participantEmail.toLowerCase().trim(),
        })
        .exec();

      if (existingRegistration) {
        throw new HttpException(
          'This email is already registered for this event',
          HttpStatus.CONFLICT,
        );
      }

      // Create new registration
      const newRegistration = new this.registrationModel({
        event: eventObjectId,
        participantEmail: participantEmail.toLowerCase().trim(),
        participantName: createRegistrationDto.participantName.trim(),
        registrationDate: new Date(),
      });

      // Save registration
      const savedRegistration = await newRegistration.save();

      // Update event (don't wait for this to complete)
      this.eventModel
        .findByIdAndUpdate(
          eventObjectId,
          { $push: { registrations: savedRegistration._id } },
          { new: true },
        )
        .exec()
        .catch((err) => {
          console.error('Error updating event with registration:', err);
        });

      return savedRegistration;
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.code === 11000) {
        throw new HttpException(
          'This email is already registered for this event',
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        'Failed to create registration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
     // _________________________________


  async findAll(query: Record<string, any>): Promise<Registration[]> {
    try {
      return await this.registrationModel
        .find(query)
        .populate('event', 'title date location') // Populate event details
        .sort({ registrationDate: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(
        `Error fetching registrations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } 
  }
     //_______________________________

  async findOne(id: string): Promise<Registration> {
    try {
      const registration = await this.registrationModel
        .findById(id)
        .populate('event', 'name date location')
        .exec();

      if (!registration) {
        throw new HttpException('Registration not found', HttpStatus.NOT_FOUND);
      }

      return registration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error fetching registration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
     //_______________________________

  async update(
    id: string,
    updateRegistrationDto: Partial<CreateRegistrationDto>,
  ): Promise<Registration> {
    try {
      // If email is being updated, check for duplicates
      if (updateRegistrationDto.participantEmail) {
        const existingRegistration = await this.registrationModel
          .findOne({
            event: updateRegistrationDto.event,
            participantEmail: updateRegistrationDto.participantEmail,
            _id: { $ne: id }, // Exclude current registration
          })
          .exec();

        if (existingRegistration) {
          throw new HttpException(
            'This email is already registered for this event',
            HttpStatus.CONFLICT,
          );
        }
      }

      const updatedRegistration = await this.registrationModel
        .findByIdAndUpdate(id, updateRegistrationDto, { new: true })
        .populate('event', 'name date location')
        .exec();

      if (!updatedRegistration) {
        throw new HttpException('Registration not found', HttpStatus.NOT_FOUND);
      }

      return updatedRegistration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error updating registration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
     //_______________________________
  async remove(id: string): Promise<Registration> {
    try {
      const deletedRegistration = await this.registrationModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedRegistration) {
        throw new HttpException('Registration not found', HttpStatus.NOT_FOUND);
      }

      return deletedRegistration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error deleting registration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
