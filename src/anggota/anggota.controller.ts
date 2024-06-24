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
  AnggotaResponse,
  CreateAnggotaRequest,
  SearchAnggotaRequest,
  UpdateAnggotaRequest,
} from 'src/schema/anggota.schema';
import { Logger } from 'winston';
import { AnggotaService } from './anggota.service';

@Controller('anggota')
export class AnggotaController {
  constructor(
    private anggotaService: AnggotaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateAnggotaRequest,
  ): Promise<ApiResponse<AnggotaResponse>> {
    this.logger.debug(
      `Controller.member.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.anggotaService.create(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('find')
  @HttpCode(HttpStatus.OK)
  async find(@Auth() user: User): Promise<ApiResponse<AnggotaResponse>> {
    this.logger.debug(
      `Controller.member.find ${JSON.stringify({ username: user.username })}`,
    );
    const result = await this.anggotaService.find(user);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':memberId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<AnggotaResponse>> {
    this.logger.debug(
      `Controller.member.get ${JSON.stringify({ username: user.username, memberId })}`,
    );
    const result = await this.anggotaService.get(user, memberId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':memberId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdateAnggotaRequest,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<AnggotaResponse>> {
    request.noAnggota = memberId;
    this.logger.debug(
      `Controller.member.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.anggotaService.update(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':memberId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.member.delete ${JSON.stringify({ username: user.username, memberId })}`,
    );
    await this.anggotaService.remove(user, memberId);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async search(
    @Auth() user: User,
    @Query('namaAnggota') namaAnggota?: string,
    @Query('noAnggota') noAnggota?: string,
    @Query('telp') telp?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<
    ApiResponse<Omit<AnggotaResponse, 'saldoSimpanan' | 'saldoPinjaman'>[]>
  > {
    this.logger.debug(
      `Controller.member.search ${JSON.stringify({ username: user.username, namaAnggota, noAnggota, telp, page, size })}`,
    );
    const member: SearchAnggotaRequest = {
      noAnggota,
      namaAnggota,
      telp,
      // alamat,
      page: page || 1,
      size: size || 10,
    };
    return await this.anggotaService.search(user, member);
  }
}
