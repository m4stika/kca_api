import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Auth } from 'src/auth/auth.decorator';
import { TokenService } from 'src/common/token.service';
import {
  AuthenticatedRequest,
  UserLoginRequest,
  UserRegisterRequest,
  UserResponse,
  UserResponseJwt,
  UserWithToken,
} from 'src/schema/user.schema';
import { Logger } from 'winston';
import { AuthService } from './auth.service';
// import { WhatsAppService } from 'src/common/whatsapp.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    // private readonly whatsappService: WhatsAppService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) { }

  @Post('register')
  async register(
    @Body() request: UserRegisterRequest,
    @Headers('user-agent') userAgent: string,
    @Res() response: Response,
  ) {
    this.logger.debug(
      `Controller.Auth.register ${JSON.stringify({ ...request, userAgent })}`,
    );
    const result: UserWithToken = await this.authService.register({
      ...request,
      userAgent,
    });
    const { refreshToken, accessToken, ...user } = result;
    this.tokenService.setToken(result, response);

    response.status(HttpStatus.OK).json({
      status: 'success',
      data: user,
    });
  }

  @Post('login')
  async login(
    @Req() req: AuthenticatedRequest,
    @Body() request: UserLoginRequest,
    @Headers('user-agent') userAgent: string,
    @Res() response: Response,
  ) {
    this.logger.debug(
      `Controller.login ${JSON.stringify({ ...request, userAgent })}`,
    );

    let newUser = req.user;
    if (!req.user) {
      const result: UserWithToken = await this.authService.login({
        ...request,
        userAgent,
      });
      const { refreshToken, accessToken, ...other } = result;
      this.tokenService.setToken(result, response);
      newUser = other;
    } else {
      this.logger.debug(`User ${req.user.username} has logged`);

      const { iat, exp, ...other } = newUser as UserResponseJwt;
      newUser = other;
    }

    //     await this.whatsappService.sendMessage(newUser.phone, `
    // *=== KCA-MOBILE ===* 
    //
    // Anda baru saja login dari ${userAgent}
    // dengan user ${newUser.username}
    // `)
    //
    response.status(HttpStatus.OK).json({
      status: 'success',
      data: newUser,
    });
  }

  @Post('logout')
  async logout(@Auth() user: UserResponse, @Res() res: Response) {
    this.logger.debug(`Controller.Auth.logout ${user.username}`);
    const id = user.session.id;

    // update status session menjadi tidak valid
    await this.authService.logout(id);
    this.tokenService.clearAllCookie(res);
    res.status(HttpStatus.OK).json(<ApiResponse<string>>{
      status: 'success',
      data: 'Logged out successfully',
    });
  }

  @Get('isAuthenticated')
  @HttpCode(HttpStatus.OK)
  async isAuthenticated(
    @Auth() user: UserResponse,
  ): Promise<ApiResponse<UserResponse>> {
    this.logger.debug(`Controller.get.isAuthenticated ${user.username}`);

    return {
      status: 'success',
      data: user,
    };
  }

  @Get('isValidPhoneNumber/:phoneNumber')
  @HttpCode(HttpStatus.OK)
  async isValidPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<ApiResponse<boolean>> {
    this.logger.debug(`Controller.get.isValidPhoneNumber ${phoneNumber}`);
    const isValid = true
    // const isValid = await this.whatsappService.checkPhoneNumber(phoneNumber)
    //     if (isValid) await this.whatsappService.sendMessage(phoneNumber, `
    // *=== KCA-MOBILE ===* 
    // Nomor ${phoneNumber} berhasil di validasi
    // `)
    if (!isValid) throw new BadRequestException(`Number ${phoneNumber} is not registered on Whatsapp`)

    return {
      status: 'success',
      data: isValid,
    };
  }
}
