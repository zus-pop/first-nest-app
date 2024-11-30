import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuthDTO } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login({ email, password }: AuthDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new ForbiddenException('Email does not exist');

    const isMatch = await argon.verify(user.hash, password);

    if (!isMatch) throw new ForbiddenException('Password is incorrect');

    return this.signToken({
      userId: user.id,
      email: user.email,
    });
  }

  async signup({ email, password }: AuthDTO) {
    const hash = await argon.hash(password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
        },
      });

      return this.signToken({
        userId: user.id,
        email: user.email,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      throw err;
    }
  }

  async signToken(user: {
    userId: number;
    email: string;
  }): Promise<{ access_token: string }> {
    const payload = {
      sub: user.userId,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
