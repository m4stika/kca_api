import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/schema/user.schema';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    if (request.user) {
      return request.user;
    } else {
      throw new UnauthorizedException();
    }
  },
);
