import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/registration.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let service: RegistrationService;

  const mockRegistration = {
    _id: 'reg123',
    event: 'event123',
    participantEmail: 'test@example.com',
    participantName: 'Test User',
    registrationDate: new Date(),
  } as any; // Type assertion here

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    service = module.get<RegistrationService>(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateRegistrationDto = {
      event: 'event123',
      participantEmail: 'test@example.com',
      participantName: 'Test User',
    };

    it('should successfully create a registration', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockRegistration);

      const result = await controller.create(createDto);

      expect(result).toBe(mockRegistration);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should propagate HttpException from service', async () => {
      const httpError = new HttpException(
        'Event not found',
        HttpStatus.NOT_FOUND,
      );
      jest.spyOn(service, 'create').mockRejectedValue(httpError);

      await expect(controller.create(createDto)).rejects.toThrow(httpError);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should wrap non-HttpException errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('findAll', () => {
    const queryParams = { event: 'event123' };

    it('should return all registrations', async () => {
      const mockRegistrations = [mockRegistration];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockRegistrations);

      const result = await controller.findAll(queryParams);

      expect(result).toBe(mockRegistrations);
      expect(service.findAll).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findOne', () => {
    const registrationId = 'reg123';

    it('should return a single registration', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRegistration);

      const result = await controller.findOne(registrationId);

      expect(result).toBe(mockRegistration);
      expect(service.findOne).toHaveBeenCalledWith(registrationId);
    });

    it('should throw HttpException when registration not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(registrationId)).rejects.toThrow(
        new HttpException('Registration not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const registrationId = 'reg123';
    const updateDto: Partial<CreateRegistrationDto> = {
      participantName: 'Updated Name',
    };

    it('should update a registration', async () => {
      const updatedRegistration = { ...mockRegistration, ...updateDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedRegistration);

      const result = await controller.update(registrationId, updateDto);

      expect(result).toBe(updatedRegistration);
      expect(service.update).toHaveBeenCalledWith(registrationId, updateDto);
    });
  });

  describe('remove', () => {
    const registrationId = 'reg123';

    it('should remove a registration', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockRegistration);

      const result = await controller.remove(registrationId);
    

      expect(result).toBe(mockRegistration);
      expect(service.remove).toHaveBeenCalledWith(registrationId);
    });
  });
});
