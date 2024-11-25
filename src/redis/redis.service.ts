import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.on('error', (err) => {
      console.error(err);
    })
      .on('connect', () => {
        console.log('Connected to Redis');
      })
      .connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }

  async getValue<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value) {
      console.log('Cache Hit');
      return JSON.parse(value);
    }
    console.log('Cache Miss');
    return null;
  }
}
