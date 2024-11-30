import { Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class LoggerMiddleWare implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleWare.name);
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Middleware: ${req.method} ${req.url}`);
    next();
  }
}
