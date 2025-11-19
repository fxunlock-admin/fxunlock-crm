import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const token = this.generateToken(user.id, user.email, user.role);
    
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role);
    
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  generateToken(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
