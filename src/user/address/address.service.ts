import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddressResponse,
  AddressValidation,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from 'src/schema/address.schema';
import { Logger } from 'winston';
import { ContactService } from '../member/member.service';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
    private readonly contactService: ContactService,
  ) {}

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      memberId: address.memberId,
      street: address.street,
      city: address.city,
      country: address.country,
      province: address.province,
      postalCode: address.postalCode,
    };
  }

  async checkAddressMustExist(
    memberId: number,
    addressId: number,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, memberId },
    });

    if (!address) {
      throw new NotFoundException('Address is not found');
    }

    return address;
  }

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    await this.contactService.checkMemberMustExist(
      user.username,
      request.memberId,
    );

    const address = await this.prisma.address.create({
      data: { ...createRequest },
    });

    return this.toAddressResponse(address);
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    const getRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkMemberMustExist(
      user.username,
      request.memberId,
    );

    const address = await this.checkAddressMustExist(
      getRequest.memberId,
      getRequest.addressId,
    );

    return this.toAddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const updateRequest: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );

    await this.contactService.checkMemberMustExist(
      user.username,
      request.memberId,
    );

    let address = await this.checkAddressMustExist(
      updateRequest.memberId,
      updateRequest.id,
    );

    address = await this.prisma.address.update({
      where: { id: address.id, memberId: address.memberId },
      data: updateRequest,
    });

    return this.toAddressResponse(address);
  }

  async remove(
    user: User,
    request: RemoveAddressRequest,
  ): Promise<AddressResponse> {
    const removeRequest: RemoveAddressRequest = this.validationService.validate(
      AddressValidation.REMOVE,
      request,
    );

    await this.contactService.checkMemberMustExist(
      user.username,
      removeRequest.memberId,
    );

    let address = await this.checkAddressMustExist(
      removeRequest.memberId,
      removeRequest.addressId,
    );

    address = await this.prisma.address.delete({
      where: { id: address.id, memberId: address.memberId },
    });

    return this.toAddressResponse(address);
  }

  async getAll(user: User, memberId: number): Promise<AddressResponse[]> {
    await this.contactService.checkMemberMustExist(user.username, memberId);

    const addresses = await this.prisma.address.findMany({
      where: { memberId },
    });

    return addresses.map((address) => this.toAddressResponse(address));
  }
}
