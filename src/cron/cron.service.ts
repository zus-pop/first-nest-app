import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private count = 0;
  private readonly logger = new Logger(CronService.name);
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND, {
    name: 'testJob',
    disabled: true,
  })
  testJob() {
    const job = this.schedulerRegistry.getCronJob('testJob');
    if (this.configService.get('NODE_ENV') === 'test') return job.stop();

    this.logger.log('Cron job is running...');

    this.count++;
    if (this.count === 5) {
      this.logger.log('Cron job is stopping...');
      job.stop();
      return;
    }
  }
}
