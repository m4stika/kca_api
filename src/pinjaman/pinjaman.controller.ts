import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Auth } from 'src/auth/auth.decorator';
import {
  CreatePinjamanRequest,
  PinjamanResponse,
  SearchPinjamanRequest,
  UpdatePinjamanRequest,
} from 'src/schema/pinjaman.schema';
import { Logger } from 'winston';
import { PinjamanService } from './pinjaman.service';

@Controller('pinjaman')
export class PinjamanController {
  constructor(
    private pinjamanService: PinjamanService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreatePinjamanRequest,
  ): Promise<ApiResponse<PinjamanResponse>> {
    this.logger.debug(
      `Controller.pinjaman.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.pinjamanService.create(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Auth() user: User,
    @Query('namaAnggota') namaAnggota?: string,
    @Query('noAnggota') noAnggota?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<ApiResponse<Omit<PinjamanResponse, 'terbayar' | 'sisa'>[]>> {
    this.logger.debug(
      `Controller.pinjaman.search ${JSON.stringify({ username: user.username, namaAnggota, noAnggota, page, size })}`,
    );
    const member: SearchPinjamanRequest = {
      noAnggota,
      namaAnggota,
      page: page || 1,
      size: size || 10,
    };
    return await this.pinjamanService.search(user, member);
  }

  @Get('byAnggota/:noAnggota')
  @HttpCode(HttpStatus.OK)
  async getByAnggota(
    @Auth() user: User,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<PinjamanResponse[]>> {
    this.logger.debug(
      `Controller.pinjaman.getByAnggota ${JSON.stringify({ username: user.username, noAnggota })}`,
    );
    const result = await this.pinjamanService.getByAnggota(noAnggota);
    return {
      status: 'success',
      data: result,
    };
  }


  @Get('defaultInterestRate')
  @HttpCode(HttpStatus.OK)
  async getInterestRate(
    @Auth() user: User,
  ): Promise<ApiResponse<unknown>> {
    this.logger.debug(
      `Controller.pinjaman.getInterestRate ${JSON.stringify({ username: user.username })}`,
    );
    const result = await this.pinjamanService.getInterestRate()
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':refCode')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('refCode') refCode: string,
  ): Promise<ApiResponse<PinjamanResponse>> {
    this.logger.debug(
      `Controller.pinjaman.get ${JSON.stringify({ username: user.username, refCode })}`,
    );
    const result = await this.pinjamanService.get(refCode);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':refCode')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdatePinjamanRequest,
    @Param('refCode') refCode: string,
  ): Promise<ApiResponse<PinjamanResponse>> {
    request.refCode = refCode;
    this.logger.debug(
      `Controller.pinjaman.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.pinjamanService.update(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':refCode')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('refCode') refCode: string,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.pinjaman.delete ${JSON.stringify({ username: user.username, refCode })}`,
    );
    await this.pinjamanService.remove(refCode);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }
}
