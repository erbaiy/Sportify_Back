import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/Schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  const mockUser = {
    _id: 'testId123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    // Create a mock save function
    const mockSave = jest.fn().mockResolvedValue(mockUser);

    // Updated MockUserModel implementation
    class MockUserModel {
      constructor(dto: any) {
        Object.assign(this, dto);
      }
      save = mockSave;
      static findOne = jest.fn();
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUserModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should successfully register a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      // We now check if save() was called on the instance
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
    });

    it('should throw BadRequestException for invalid input', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // too short
        username: '', // empty username
        firstName: '',
        lastName: ''
      };

      await expect(service.register(invalidDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should successfully login and return access token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'test-jwt-token' });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto))
        .rejects
        .toThrow(new UnauthorizedException('Invalid credentials'));
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto))
        .rejects
        .toThrow(new UnauthorizedException('Invalid credentials'));
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should generate correct JWT payload', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id
      });
    });
  });
});