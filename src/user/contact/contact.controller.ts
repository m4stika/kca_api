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
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/schema/contact.schema';
import { Logger } from 'winston';
import { ContactService } from './contact.service';

@Controller('contacts')
export class ContactController {
  constructor(
    private contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<ApiResponse<ContactResponse>> {
    this.logger.debug(
      `Controller.contact.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.contactService.create(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':contactId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<ApiResponse<ContactResponse>> {
    this.logger.debug(
      `Controller.contact.get ${JSON.stringify({ username: user.username, contactId })}`,
    );
    const result = await this.contactService.get(user, contactId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':contactId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateContactRequest,
  ): Promise<ApiResponse<ContactResponse>> {
    request.id = contactId;
    this.logger.debug(
      `Controller.contact.update ${JSON.stringify({ ...request, username: user.username })}`,
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
      `Controller.contact.delete ${JSON.stringify({ username: user.username, contactId })}`,
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
  ): Promise<ApiResponse<ContactResponse[]>> {
    this.logger.debug(
      `Controller.contact.search ${JSON.stringify({ username: user.username, name, email, phone, page, size })}`,
    );
    const request: SearchContactRequest = {
      name,
      email,
      phone,
      page: page || 1,
      size: size || 10,
    };
    return await this.contactService.search(user, request);
  }
}
