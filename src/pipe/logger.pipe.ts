import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class LoggerPipe implements PipeTransform {
  private readonly logger = new Logger(LoggerPipe.name);
  transform(value: any, metadata: ArgumentMetadata) {
    this.logger.log(`value: ${JSON.stringify(value)}`);
    this.logger.log(`metadata: ${JSON.stringify(metadata)}`);
    return value;
  }
}
