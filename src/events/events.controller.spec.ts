import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './../events/events.controller';
import { EventsService } from './../events/events.service';
import { CreateEventDto } from './../events/dto/create-event.dto';
import { UpdateEventDto } from './../events/dto/update-event.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { Types } from 'mongoose';

// Mock AuthGuard and JwtStrategy
const mockAuthGuard = {
  canActivate: jest.fn().mockResolvedValue(true), // Always return true, bypassing authentication logic
};

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEvent = {
    _id: new Types.ObjectId('674a0bcf77b4d65873dad5d2'),
    title: 'Qui inventore omnis',
    image: null,
    description: 'Consectetur et aut i',
    date: new Date('2025-09-09T00:00:00.000Z'),
    location: 'Quia asperiores nesc',
    maxParticipants: 3,
    registrationDeadline: new Date('1993-10-02T00:00:00.000Z'),
    organizer: new Types.ObjectId('67498d7ee9740ca45545260d'),
    status: 'ongoing',
    createdAt: new Date('2024-11-29T18:45:35.561Z'),
    updatedAt: new Date('2024-11-30T14:47:06.112Z'),
  };

  const mockRequest = {
    user: { sub: 'user123' }, // Simulate a JWT token's payload
  };

  const mockFile = {
    filename: 'test-image.jpg',
  } as Express.Multer.File;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard, // Use the mock AuthGuard
        },
        {
          provide: JwtStrategy,
          useValue: {}, // Mock JwtStrategy if necessary (you can mock specific methods if needed)
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const mockEvents = [mockEvent];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockEvents);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockEvents);
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'New Event',
        description: 'Event description',
        date: new Date('2025-09-09T00:00:00.000Z'),
        location: 'Location',
        maxParticipants: 3,
        registrationDeadline: new Date('2025-09-01T00:00:00.000Z'),
      };
      const organizer = 'user123';
      jest.spyOn(service, 'create').mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto, mockFile, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createEventDto, organizer);
      expect(result).toEqual(mockEvent);
    });

    it('should handle errors in event creation', async () => {
      const createEventDto: CreateEventDto = {
        title: 'New Event',
        description: 'Event description',
        date: new Date('2025-09-09T00:00:00.000Z'),
        location: 'Location',
        maxParticipants: 3,
        registrationDeadline: new Date('2025-09-01T00:00:00.000Z'),
      };
      jest.spyOn(service, 'create').mockRejectedValue(new Error('Failed to create event'));

      try {
        await controller.create(createEventDto, mockFile, mockRequest);
      } catch (error) {
        expect(error.response).toBe('Failed to create event');
        expect(error.status).toBe(400); // Assuming the error throws an HttpException with BAD_REQUEST
      }
    });
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEvent);

      const result = await controller.findOne(mockEvent._id.toString());

      expect(service.findOne).toHaveBeenCalledWith(mockEvent._id.toString());
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error if the event is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne(mockEvent._id.toString());
      } catch (error) {
        expect(error.response).toBe('Event not found');
        expect(error.status).toBe(404); // Event not found should return NOT_FOUND
      }
    });
  });

  describe('update', () => {
    it('should update an event successfully', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        description: 'Updated description',
        date: new Date('2025-10-10T00:00:00.000Z'),
        location: 'Updated Location',
        maxParticipants: 5,
        registrationDeadline: new Date('2025-09-15T00:00:00.000Z'),
      };
      jest.spyOn(service, 'update').mockResolvedValue(mockEvent);

      const result = await controller.update(mockEvent._id.toString(), updateEventDto, mockFile);

      expect(service.update).toHaveBeenCalledWith(mockEvent._id.toString(), updateEventDto);
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error if the event is not found while updating', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        description: 'Updated description',
        date: new Date('2025-10-10T00:00:00.000Z'),
        location: 'Updated Location',
        maxParticipants: 5,
        registrationDeadline: new Date('2025-09-15T00:00:00.000Z'),
      };
      jest.spyOn(service, 'update').mockResolvedValue(null);

      try {
        await controller.update(mockEvent._id.toString(), updateEventDto, mockFile);
      } catch (error) {
        expect(error.response).toBe('Event not found');
        expect(error.status).toBe(404); // Event not found should return NOT_FOUND
      }
    });
  });

  describe('delete', () => {
    it('should delete an event successfully', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(mockEvent);

      const result = await controller.delete(mockEvent._id.toString());

      expect(service.delete).toHaveBeenCalledWith(mockEvent._id.toString());
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error if the event is not found while deleting', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(null);

      try {
        await controller.delete(mockEvent._id.toString());
      } catch (error) {
        expect(error.response).toBe('Event not found');
        expect(error.status).toBe(404); // Event not found should return NOT_FOUND
      }
    });
  });
});
