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
  CreateMemberRequest,
  MemberResponse,
  SearchMemberRequest,
  UpdateMemberRequest,
} from 'src/schema/member.schema';
import { Logger } from 'winston';
import { ContactService } from './member.service';

@Controller('members')
export class ContactController {
  constructor(
    private contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateMemberRequest,
  ): Promise<ApiResponse<MemberResponse>> {
    this.logger.debug(
      `Controller.member.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.contactService.create(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('find')
  @HttpCode(HttpStatus.OK)
  async find(@Auth() user: User): Promise<ApiResponse<MemberResponse>> {
    this.logger.debug(
      `Controller.member.find ${JSON.stringify({ username: user.username })}`,
    );
    const result = await this.contactService.find(user);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':memberId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<ApiResponse<MemberResponse>> {
    this.logger.debug(
      `Controller.member.get ${JSON.stringify({ username: user.username, memberId })}`,
    );
    const result = await this.contactService.get(user, memberId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':memberId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdateMemberRequest,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<ApiResponse<MemberResponse>> {
    request.id = memberId;
    this.logger.debug(
      `Controller.member.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.contactService.update(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':contactId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.member.delete ${JSON.stringify({ username: user.username, contactId })}`,
    );
    await this.contactService.remove(user, contactId);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async search(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<ApiResponse<MemberResponse[]>> {
    this.logger.debug(
      `Controller.member.search ${JSON.stringify({ username: user.username, name, email, phone, page, size })}`,
    );
    const member: SearchMemberRequest = {
      name,
      email,
      phone,
      page: page || 1,
      size: size || 10,
    };
    return await this.contactService.search(user, member);
  }
}
