import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ZodError } from 'zod';

@Catch(
  ZodError,
  HttpException,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
)
export class ErrorFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    // const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = (exception as HttpException).getStatus();
      this.logger.error(
        `HttpException Error: ${(exception as HttpException).message}`,
      );
      response.status(status).json({
        status: 'error',
        message: (exception as HttpException).message,
        errorType: 'error',
        tokenExpired: false,
      });
    } else if (exception instanceof ZodError) {
      // console.dir(response as ZodError, { depth: 3 });
      this.logger.error(
        `validation Error ${(exception as ZodError).issues[0].path[0]} ${exception.issues[0].message}`,
      );
      response.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: `${(exception as ZodError).issues[0].path[0]} ${exception.issues[0].message}`,
        issues: (exception as ZodError).issues,
        errorType: 'schema',
        tokenExpired: false,
      });
    } else if (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientUnknownRequestError ||
      exception instanceof PrismaClientInitializationError ||
      exception instanceof PrismaClientRustPanicError ||
      exception instanceof PrismaClientValidationError
    ) {
      this.logger.error(
        `Prisma Error: ${(exception as PrismaClientKnownRequestError).name}`,
      );
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        status: 'error',
        // message: `Prisma Error: ${error.code} => ${error.message}`,
        message: `Prisma Error: ${(exception as PrismaClientKnownRequestError).name}`,
        errorType: 'prisma',
        tokenExpired: false,
      });
    } else {
      this.logger.error(`Unknown Error: ${exception.message}`);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: (exception as HttpException).message,
        errorType: 'unknown',
        tokenExpired: false,
        // errors: `Unknown Error: ${exception.message}`,
      });
    }
  }
}
