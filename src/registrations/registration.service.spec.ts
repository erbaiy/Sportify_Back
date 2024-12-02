import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { getModelToken } from '@nestjs/mongoose';
import { Registration } from './Schema/registration.schema';
import { Event } from '../events/schemas/events.schema';
import mongoose, { Model, Types } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/registration.dto';
import { exec } from 'child_process';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let registrationModel: Model<Registration>;
  let eventModel: Model<Event>;

  const mockRegistration = {
    _id: new Types.ObjectId(),
    event: new Types.ObjectId(),
    participantEmail: 'test@example.com',
    participantName: 'Test User',
    registrationDate: new Date(),
    save: jest.fn(),
  };

  const mockEvent = {
    _id: new Types.ObjectId(),
    title: 'Test Event',
    date: new Date(),
    location: 'Test Location',
  };

  const mockRegistrationModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    new: jest.fn().mockResolvedValue(mockRegistration),
  };

  const mockEventModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockEvent), // Add `exec` here
    }),
    findByIdAndUpdate: jest.fn(),
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: getModelToken(Registration.name),
          useValue: mockRegistrationModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel, // Use the updated mock
        },
      ],
    }).compile();
  
    service = module.get<RegistrationService>(RegistrationService);
    registrationModel = module.get<Model<Registration>>(getModelToken(Registration.name));
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });
  

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateRegistrationDto = {
      event: mockEvent._id.toString(),
      participantEmail: 'test@example.com',
      participantName: 'Test User',
    };

    it('should successfully create a registration', async () => {
     
    });
    it('should throw an error if the event does not exist', async () => {
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
  
      const dto: CreateRegistrationDto = {
        event: new mongoose.Types.ObjectId().toString(),
        participantEmail: 'test@example.com',
        participantName: 'Test User',
      };
  
      await expect(service.create(dto)).rejects.toThrowError(
        new HttpException('Event not found', HttpStatus.NOT_FOUND),
      );
  
      expect(mockEventModel.findById).toHaveBeenCalledWith(expect.any(mongoose.Types.ObjectId));
    });

    it('should throw an error if the email is already registered for the event', async () => {
      const eventObjectId = new mongoose.Types.ObjectId();
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: eventObjectId }),
      });
      mockRegistrationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      });
  
      const dto: CreateRegistrationDto = {
        event: eventObjectId.toString(),
        participantEmail: 'test@example.com',
        participantName: 'Test User',
      };
  
      await expect(service.create(dto)).rejects.toThrowError(
        new HttpException(
          'This email is already registered for this event',
          HttpStatus.CONFLICT,
        ),
      );
  
      expect(mockRegistrationModel.findOne).toHaveBeenCalledWith({
        event: eventObjectId,
        participantEmail: dto.participantEmail.toLowerCase().trim(),
      });
    });

    // it('should create and return the registration successfully', async () => {
    //   mockRegistrationModel.findOne.mockReturnValue({
    //     exec: jest.fn().mockResolvedValue(null),
    //   });
    //   mockRegistrationModel.save = jest.fn().mockResolvedValue(mockRegistration);
    //   mockEventModel.findById.mockReturnValue({
    //     exec: jest.fn().mockResolvedValue(mockEvent),
    //   });
            

    //   const dto: CreateRegistrationDto = {
    //     event: mockEvent._id.toString(),
    //     participantEmail: 'test@example.com',
    //     participantName: 'Test User',
    //   };
    
    //   const result = await service.create(dto);
    
    //   expect(result).toMatchObject({
    //     participantEmail: 'test@example.com',
    //     participantName: 'Test User',
    //   });
    //   expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
    //     mockEvent._id,
    //     { $push: { registrations: expect.any(Object) } },
    //     { new: true },
    //   );
    // });
    

  });

  describe('findAll', () => {
    it('should return all registrations', async () => {
      const mockRegistrations = [mockRegistration];
      mockRegistrationModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRegistrations),
          }),
        }),
      });

      const result = await service.findAll({});

      expect(result).toEqual(mockRegistrations);
      expect(mockRegistrationModel.find).toHaveBeenCalled();
    });

    it('should throw error if finding registrations fails', async () => {
      mockRegistrationModel.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    const registrationId = mockRegistration._id.toString();

    it('should return a registration', async () => {
      mockRegistrationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRegistration),
        }),
      });

      const result = await service.findOne(registrationId);

      expect(result).toEqual(mockRegistration);
      expect(mockRegistrationModel.findById).toHaveBeenCalledWith(registrationId);
    });

    it('should throw NOT_FOUND if registration does not exist', async () => {
      mockRegistrationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(registrationId)).rejects.toThrow(
        new HttpException('Registration not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('update', () => {
    const registrationId = mockRegistration._id.toString();
    const updateDto = { participantName: 'Updated Name' };

    it('should update a registration', async () => {
      mockRegistrationModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...mockRegistration, ...updateDto }),
        }),
      });

      const result = await service.update(registrationId, updateDto);

      expect(result).toEqual({ ...mockRegistration, ...updateDto });
      expect(mockRegistrationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        registrationId,
        updateDto,
        { new: true }
      );
    });

    it('should throw NOT_FOUND if registration does not exist', async () => {
      mockRegistrationModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.update(registrationId, updateDto)).rejects.toThrow(
        new HttpException('Registration not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('remove', () => {
    const registrationId = mockRegistration._id.toString();

    it('should delete a registration', async () => {
      mockRegistrationModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRegistration),
      });

      const result = await service.remove(registrationId);

      expect(result).toEqual(mockRegistration);
      expect(mockRegistrationModel.findByIdAndDelete).toHaveBeenCalledWith(registrationId);
    });

    it('should throw NOT_FOUND if registration does not exist', async () => {
      mockRegistrationModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(registrationId)).rejects.toThrow(
        new HttpException('Registration not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});