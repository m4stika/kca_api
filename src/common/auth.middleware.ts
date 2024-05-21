import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedRequest, UserResponseJwt } from 'src/schema/user.schema';
import { Logger } from 'winston';
import { TokenService } from './token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}
  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    this.logger.info(
      `Request from ${req.headers.host} -> ${req.method} url: ${req.url} `,
    );

    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
      this.logger.debug(`AuthMiddleware.accessToken.notFound`);
      req.user = null;
      this.tokenService.clearAllCookie(res);
      next();
      return;
    }

    try {
      const decoded: UserResponseJwt = this.jwtService.verify(accessToken);

      const session = await this.authService.getSession(decoded.session.id);

      if (!session) {
        this.logger.debug(`AuthMiddleware.session.notFound`);
        this.tokenService.clearAllCookie(res);
        req.user = null;
        return next();
      }

      const { iat, exp, ...user } = decoded;
      req.user = user;
      next();
      return;
    } catch (error) {
      // jika access-token sudah tidak valid
      // lakukan generate access-token yang baru, mengacu pada refresh-token, jika refresh-token tersedia

      if (refreshToken) {
        const newAccessToken =
          await this.tokenService.reIssueAccessToken(refreshToken);

        // not valid new accessToken
        if (newAccessToken === false) {
          this.logger.debug(`AuthMiddleware.reIssueAccessToken.false`);
          this.tokenService.clearAllCookie(res);
          req.user = null;
          try {
            const oldUser: UserResponseJwt =
              this.jwtService.decode(accessToken);
            const sessionId = oldUser.session.id;
            if (sessionId) await this.authService.logout(sessionId);
          } catch (error) {
            return next();
          }
          return next();
        }

        try {
          const resultDecoded: UserResponseJwt =
            this.jwtService.verify(newAccessToken);
          const { iat, exp, ...payload } = resultDecoded;
          req.user = payload;
          this.logger.debug(
            `AuthMiddleware.newAccessToken => ${newAccessToken}`,
          );
          this.tokenService.setToken(
            {
              ...payload,
              accessToken: newAccessToken,
              refreshToken,
            },
            res,
          );
          return next();
        } catch (error) {
          this.tokenService.clearAllCookie(res);
          req.user = null;
          next();
          return;
        }
      }
      req.user = null;
      next();
    }
    next();
  }
}
