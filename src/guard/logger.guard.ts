import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

export class LoggerGuard implements CanActivate {
  private readonly logger = new Logger(LoggerGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.log(`Guard: ${request.method}`);
    return true;
  }
}
