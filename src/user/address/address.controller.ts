import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from 'src/schema/address.schema';
import { AddressService } from './address.service';

@Controller('contacts/:contactId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressRequest,
  ): Promise<ApiResponse<AddressResponse>> {
    request.contactId = contactId;
    const result = await this.addressService.create(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':addressId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<ApiResponse<AddressResponse>> {
    const request: GetAddressRequest = {
      contactId,
      addressId,
    };
    const result = await this.addressService.get(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':addressId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressRequest,
  ): Promise<ApiResponse<AddressResponse>> {
    request.id = addressId;
    request.contactId = contactId;

    const result = await this.addressService.update(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<ApiResponse<string>> {
    const request: RemoveAddressRequest = {
      contactId,
      addressId,
    };
    await this.addressService.remove(user, request);

    return {
      status: 'success',
      data: 'Address has been deleted',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<ApiResponse<AddressResponse[]>> {
    const result = await this.addressService.getAll(user, contactId);

    return {
      status: 'success',
      data: result,
    };
  }
}
