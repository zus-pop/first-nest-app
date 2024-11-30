import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll() {
    this.logger.log('Before emit');
    this.eventEmitter.emit(
      'user.findAll',
      'this is the message from the eventEmitter',
    );
    this.logger.log('After emit');
    const cache = await this.redis.getValue<User[]>('users');
    if (cache) return cache;
    const users = await this.prismaService.user.findMany({
      omit: {
        hash: true,
      },
    });
    this.redis.set('users', JSON.stringify(users), 'EX', 30, 'NX');
    return users;
  }

  @OnEvent('user.findAll', { async: false })
  getUsersFromEvent(message: string) {
    setTimeout(() => {
      this.logger.log(message);
    }, 5000);
  }

  async editUser(id: number, editUserDto: EditUserDto) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...editUserDto,
      },
      omit: {
        hash: true,
      },
    });
  }
}
