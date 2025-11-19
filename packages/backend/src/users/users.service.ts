import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { CreateUserDto, UpdateProfileDto, UpdateBrokerProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        role: dto.role,
        status: UserStatus.PENDING,
      },
      include: {
        profile: true,
        brokerProfile: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        brokerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        brokerProfile: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);

    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  async updateBrokerProfile(userId: string, dto: UpdateBrokerProfileDto) {
    const user = await this.findById(userId);

    if (user.role !== UserRole.BROKER) {
      throw new ConflictException('User is not a broker');
    }

    return this.prisma.brokerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  async getBrokerProfile(userId: string) {
    const profile = await this.prisma.brokerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Broker profile not found');
    }

    return profile;
  }
}
