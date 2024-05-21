import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Session } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import environmentConfig from 'src/config/environment.config';
import { UserResponseJwt, UserWithToken } from 'src/schema/user.schema';
import { Logger } from 'winston';
import { PrismaService } from './prisma.service';

@Injectable()
export class TokenService {
  private readonly expiredInHours: number;
  private readonly cookieOptions: CookieOptions;

  constructor(
    @Inject(environmentConfig.KEY)
    private readonly configService: ConfigType<typeof environmentConfig>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.expiredInHours =
      this.configService.COOKIES_EXPIRED_DAY * 24 || //day(s)
      this.configService.COOKIES_EXPIRED_TIME || //hour(s)
      1; //default 1 hour

    this.cookieOptions = {
      httpOnly: true,
      // secure: !this.configService.isDev(),
      secure: this.configService.NODE_ENV !== 'development',
      maxAge: this.expiredInHours * 60 * 60 * 1000,
      // expires: exp,
    };
  }

  clearAllCookie = (res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('authorized');
    res.clearCookie('activeUser');
    res.cookie('authorized', false, this.cookieOptions);
  };

  private getSession = async (id: string): Promise<Session | false> => {
    const session = await this.prisma.session.findUnique({
      where: { id, valid: true },
    });
    if (!session) return false;
    return session;
  };

  private async signAccessToken<T extends object>(payload: T) {
    const expiresIn = this.configService.JWT_ACCESS_TOKEN; //  process.env.JWT_REFRESH_TOKEN || '1d';
    this.logger.debug(`accessToken.expiresIn : ${expiresIn}`);

    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  private async signRefreshToken<T extends object>(payload: T) {
    const expiresIn = this.configService.JWT_REFRESH_TOKEN; //  process.env.JWT_REFRESH_TOKEN || '1d';
    this.logger.debug(`refreshToken.expiresIn : ${expiresIn}`);

    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  reIssueAccessToken = async (token: string): Promise<string | false> => {
    try {
      const decoded: UserResponseJwt = this.jwtService.verify(token);
      if (!decoded || !decoded.session) return false;

      // check if the session still valid
      if (decoded.session.id) {
        const session = await this.getSession(decoded.session.id);
        if (!session) {
          this.logger.error('session is no longer valid');
          return false;
        }
      }

      const { iat, exp, ...newUser } = decoded;
      const resultAccessToken = await this.signAccessToken(newUser);

      return resultAccessToken;
    } catch (error) {
      this.logger.error(`Error refresh token ${(error as Error).message}`);
      return false;
    }
  };

  async signToken<T extends object>(payload: T) {
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  setToken(payload: UserWithToken, res: Response): void {
    const { refreshToken, accessToken, ...user } = payload;

    this.logger.debug({ setToken_cookieOption: this.cookieOptions });

    res.cookie('accessToken', accessToken, this.cookieOptions);
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
    res.cookie('activeUser', JSON.stringify(user), this.cookieOptions);
    res.cookie('authorized', true, this.cookieOptions);

    // return res;
  }
}
