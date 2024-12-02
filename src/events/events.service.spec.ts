import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event } from './schemas/events.schema';
import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Model } from 'mongoose';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('EventsService', () => {
  let service: EventsService;
  let mockEventModel: any;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  const mockEvent = {
    _id: '60a2c1f4b4f3d5d8473e915e',
    title: 'Sample Event',
    date: new Date('2025-01-01'),
    registrationDeadline: new Date('2024-12-01'),
    maxParticipants: 100,
    location: 'Somewhere',
    description: 'Event description',
    status: 'ongoing',
    image: 'image.jpg',
    organizer: 'user123',
  };

  beforeEach(async () => {
    const MockEventModel = function (this: any, dto: any) {
      this._id = mockEvent._id;
      Object.assign(this, dto);
      this.save = jest.fn().mockResolvedValue(this);
    } as any;

    MockEventModel.prototype.save = jest.fn();
    MockEventModel.findOne = jest.fn();
    MockEventModel.find = jest.fn();
    MockEventModel.findById = jest.fn();
    MockEventModel.findByIdAndUpdate = jest.fn();
    MockEventModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: MockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    mockEventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create an event', async () => {
      const createEventDto = {
        title: 'New Event',
        description: 'Event description',
        date: new Date('2025-01-01'),
        registrationDeadline: new Date('2024-12-01'),
        maxParticipants: 100,
        location: 'Test Location',
      };
      const organizer = 'user123';

      mockEventModel.findOne.mockResolvedValue(null);

      const result = await service.create(createEventDto, organizer);

      expect(result).toBeDefined();
      expect(result.title).toBe(createEventDto.title);
      expect(result.organizer).toBe(organizer);
    });

    it('should throw error if event with title already exists', async () => {
      const createEventDto = {
        title: 'Sample Event',
        description: 'Event description',
        date: new Date('2025-09-09'),
        location: 'Location',
        maxParticipants: 3,
        registrationDeadline: new Date('2025-09-01'),
      };
      const organizer = 'user123';

      mockEventModel.findOne.mockResolvedValue(mockEvent);

      await expect(service.create(createEventDto, organizer)).rejects.toThrow(
        new HttpException(
          `Event with title ${createEventDto.title} already exists`,
          400,
        ),
      );
    });

    it('should throw error if event date is in the past', async () => {
      const createEventDto = {
        ...mockEvent,
        date: new Date('2020-01-01'),
        registrationDeadline: new Date('2019-12-01'),
      };

      mockEventModel.findOne.mockResolvedValue(null);

      await expect(service.create(createEventDto, 'user123')).rejects.toThrow(
        new HttpException('Event date cannot be in the past', 400),
      );
    });

    it('should throw error if registration deadline is after event date', async () => {
      const createEventDto = {
        ...mockEvent,
        date: new Date('2025-01-01'),
        registrationDeadline: new Date('2025-02-01'),
      };

      mockEventModel.findOne.mockResolvedValue(null);

      await expect(service.create(createEventDto, 'user123')).rejects.toThrow(
        new HttpException(
          'Registration deadline cannot be after the event date',
          400,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const mockEvents = [mockEvent];
      mockEventModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvents),
      });

      const result = await service.findAll({});
      expect(result).toEqual(mockEvents);
      expect(mockEventModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('update', () => {
    it('should update the event', async () => {
      const updateDto = { title: 'Updated Event' };
      const updatedEvent = { ...mockEvent, ...updateDto };

      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEvent),
      });

      const result = await service.update(mockEvent._id, updateDto);

      expect(result).toEqual(updatedEvent);
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEvent._id,
        updateDto,
        { new: true },
      );
    });

    it('should delete old image when updating with new image', async () => {
      const updateDto = { image: 'new-image.jpg' };
      const updatedEvent = { ...mockEvent, ...updateDto };
      const expectedPath = path.join('uploads', 'image.jpg');

      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEvent),
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.update(mockEvent._id, updateDto);

      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe('delete', () => {
    it('should delete event and its image', async () => {
      const expectedPath = path.join('uploads', 'image.jpg');

      mockEventModel.findById.mockResolvedValue(mockEvent);
      mockEventModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.delete(mockEvent._id);

      expect(result).toEqual(mockEvent);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedPath);
      expect(mockEventModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockEvent._id,
      );
    });

    it('should throw error if event not found during deletion', async () => {
      mockEventModel.findById.mockResolvedValue(null);

      await expect(service.delete(mockEvent._id)).rejects.toThrow(
        new HttpException(`Event with ID ${mockEvent._id} not found`, 404),
      );
    });
  });
});
