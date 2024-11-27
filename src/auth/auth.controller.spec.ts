// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { RegisterDto } from './dto/register.dto';
// import { AuthGuard } from './guards/auth.guard'; // Import your AuthGuard if it's custom
// import { JwtStrategy } from './strategies/jwt.strategy'; // Import JwtStrategy
// import { LoginDto } from './dto/login.dto';

// describe('AuthController', () => {
//   let controller: AuthController;
//   let authService: AuthService;

//   // Mock user data
//   const mockRegisterDto: RegisterDto = {
//     email: 'test@example.com',
//     password: 'password123',
//     username: 'testuser',
//     firstName: 'Test',
//     lastName: 'User',
//   };
//   const mockLoginDto:LoginDto={
//     email:'test@gmail.com',
//     password:'password123'
//   }

//   // Mock successful registration response
//   const mockRegistrationResponse = {
//     message: 'User registered successfully',
//   };

//   // Mock successful login response
//   const mockLoginResponse = {
//     access_token: 'mock-jwt-token',
//   };

//   // Create mock AuthService
//   const mockAuthService = {
//     register: jest.fn(),
//     login: jest.fn()
//   };

//   // Mock AuthGuard to bypass authentication
//   const mockAuthGuard = {
//     canActivate: jest.fn(() => true),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       providers: [
//         {
//           provide: AuthService,
//           useValue: mockAuthService,
//         },
//         {
//           provide: AuthGuard,
//           useValue: mockAuthGuard,  // Mocking the JwtAuthGuard
//         },
//         {
//           provide: JwtStrategy,
//           useValue: {},  // Provide an empty object as a mock for JwtStrategy
//         },
//       ],
//     }).compile();

//     controller = module.get<AuthController>(AuthController);
//     authService = module.get<AuthService>(AuthService);
//   });

//   // Basic controller instantiation test
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('register', () => {
//     it('should successfully register a new user', async () => {
//       // Setup mock return value
//       mockAuthService.register.mockResolvedValue(mockRegistrationResponse);
//       // Execute test
//       const result = await controller.register(mockRegisterDto);
//       // Verify service was called with correct parameters
//       expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      
//       // Verify the response
//       expect(result).toEqual(mockRegistrationResponse);
//     });

//     it('should throw an error if the  email is already exist ',async()=> {
//       const messageEmailExist={
//         message:"email already exist"
//       }
      
//       mockAuthService.register.mockRejectedValue(messageEmailExist);
//       await expect(controller.register(mockRegisterDto))
//       .rejects
//       .toEqual(messageEmailExist);
//             expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);

//     });
    


//   });

//   describe('login ',()=>{
//     it('should successfully login a user', async () => {
//       // Arrange
//       mockAuthService.login.mockResolvedValue(mockLoginResponse);

//       // Act
//       const result = await controller.login(mockRegisterDto);

//       // Assert
//       expect(authService.login).toHaveBeenCalledWith(mockRegisterDto);
//       expect(result).toEqual(mockLoginResponse);
//     });

//   });
// });



import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock user data
  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  };

  // Mock login data that matches RegisterDto structure
  const mockLoginDto: RegisterDto = {
    email: 'test@gmail.com',
    password: 'password123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  };

  // Mock successful registration response
  const mockRegistrationResponse = {
    message: 'User registered successfully',
  };

  // Mock successful login response
  const mockLoginResponse = {
    access_token: 'mock-jwt-token',
  };

  // Create mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn()
  };

  // Mock AuthGuard to bypass authentication
  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: JwtStrategy,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic controller instantiation test
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockRegistrationResponse);
      const result = await controller.register(mockRegisterDto);
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockRegistrationResponse);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the email already exists', async () => {
      const messageEmailExist = {
        message: "email already exist"
      };
      mockAuthService.register.mockRejectedValue(messageEmailExist);
      await expect(controller.register(mockRegisterDto))
        .rejects
        .toEqual(messageEmailExist);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw BadRequestException for invalid registration data', async () => {
      const invalidRegisterDto: RegisterDto = {
        email: 'invalid-email',
        password: '123',
        username: '',
        firstName: '',
        lastName: ''
      };

      const validationError = new BadRequestException('Invalid registration data');
      mockAuthService.register.mockRejectedValue(validationError);

      await expect(controller.register(invalidRegisterDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);
      const result = await controller.login(mockLoginDto);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const invalidLoginDto: RegisterDto = {
        email: 'wrong@email.com',
        password: 'wrongpassword',
        username: 'wronguser',
        firstName: 'Wrong',
        lastName: 'User'
      };

      const authError = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(authError);

      await expect(controller.login(invalidLoginDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('protected route', () => {
    it('should allow access to protected route when authenticated', async () => {
      mockAuthGuard.canActivate.mockImplementation(() => true);
      const result = controller.getProtectedRoute();
      expect(result).toBe('Cette route est protégée');
    });

    // it('should deny access to protected route when not authenticated', async () => {
    //   mockAuthGuard.canActivate.mockImplementation(() => false);
    //   await expect(async () => {
    //     await controller.getProtectedRoute();
    //   }).rejects.toThrow(UnauthorizedException);
    // });
  });
});