import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/Schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs'; // bcrypt for password hashing
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt'; // Import the JwtService


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService, // Inject JwtService for JWT token operations

      ) {}
      async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;
        const existingUser = await this.userModel.findOne({ email });
    
        if (existingUser) {
          throw new UnauthorizedException('Email already exists');
        }
    
        // Hash the password before saving to DB
        const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of salt
    
        // Create new user with hashed password
        const newUser = new this.userModel({
          ...registerDto,
          password: hashedPassword, // Save hashed password
        });
        await newUser.save();
      }

      async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
    
        // Find user by email
        const user = await this.userModel.findOne({ email });
    
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        // Generate JWT token
        const payload = { email: user.email, sub: user._id };
        const accessToken = this.jwtService.sign(payload); // Generate token
    
        return { access_token: accessToken }; // Return JWT token
      }



}