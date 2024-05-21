import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      if (data === 'accessToken') {
        const token = request.cookies?.[data];
        if (!token) throw new UnauthorizedException();
      }
      return request.cookies?.[data];
    } else return request.cookies;
    // return data ? request.cookies?.[data] : request.cookies;
  },
);
