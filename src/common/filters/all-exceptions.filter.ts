import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();

      // If it's a 404 and user is not authenticated, return 401 instead
      if (status === HttpStatus.NOT_FOUND && !request.user) {
        status = HttpStatus.UNAUTHORIZED;
        message = { message: 'Unauthorized', statusCode: 401 };
      }
    }

    response.status(status).json(message);
  }
}
