import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);
  constructor(configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error('Redis connection lost');
          return null;
        }
        return 200;
      },
    });
  }

  async onModuleInit(): Promise<void> {
    this.on('error', (err) => {
      this.logger.error(err);
    }).on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }

  async getValue<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value) {
      this.logger.log('Cache Hit');
      return JSON.parse(value);
    }
    this.logger.log('Cache Miss');
    return null;
  }
}
