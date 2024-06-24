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
  CreateSimpananRequest,
  SearchSimpananRequest,
  SimpananResponse,
  UpdateSimpananRequest,
} from 'src/schema/simpanan.schema';
import { Logger } from 'winston';
import { SimpananService } from './simpanan.service';

@Controller('simpanan')
export class SimpananController {
  constructor(
    private simpananService: SimpananService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateSimpananRequest,
  ): Promise<ApiResponse<SimpananResponse>> {
    this.logger.debug(
      `Controller.simpanan.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.simpananService.create(user, request);
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
  ): Promise<ApiResponse<SimpananResponse[]>> {
    this.logger.debug(
      `Controller.simpanan.search ${JSON.stringify({ username: user.username, namaAnggota, noAnggota, page, size })}`,
    );
    const member: SearchSimpananRequest = {
      noAnggota,
      namaAnggota,
      page: page || 1,
      size: size || 10,
    };
    return await this.simpananService.search(user, member);
  }

  @Get(':noAnggota')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<SimpananResponse>> {
    this.logger.debug(
      `Controller.simpanan.get ${JSON.stringify({ username: user.username, noAnggota })}`,
    );
    const result = await this.simpananService.get(noAnggota);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':noAnggota')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdateSimpananRequest,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<SimpananResponse>> {
    request.noAnggota = noAnggota;
    this.logger.debug(
      `Controller.simpanan.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.simpananService.update(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':noAnggota')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.simpanan.delete ${JSON.stringify({ username: user.username, noAnggota })}`,
    );
    await this.simpananService.remove(noAnggota);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }
}
