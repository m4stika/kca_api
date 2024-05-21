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
import { ContactService } from '../contact/contact.service';

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
      contactId: address.contactId,
      street: address.street,
      city: address.city,
      country: address.country,
      province: address.province,
      postalCode: address.postalCode,
    };
  }

  async checkAddressMustExist(
    contactId: number,
    addressId: number,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, contactId },
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

    await this.contactService.checkContactMustExist(
      user.username,
      request.contactId,
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

    await this.contactService.checkContactMustExist(
      user.username,
      request.contactId,
    );

    const address = await this.checkAddressMustExist(
      getRequest.contactId,
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

    await this.contactService.checkContactMustExist(
      user.username,
      request.contactId,
    );

    let address = await this.checkAddressMustExist(
      updateRequest.contactId,
      updateRequest.id,
    );

    address = await this.prisma.address.update({
      where: { id: address.id, contactId: address.contactId },
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

    await this.contactService.checkContactMustExist(
      user.username,
      removeRequest.contactId,
    );

    let address = await this.checkAddressMustExist(
      removeRequest.contactId,
      removeRequest.addressId,
    );

    address = await this.prisma.address.delete({
      where: { id: address.id, contactId: address.contactId },
    });

    return this.toAddressResponse(address);
  }

  async getAll(user: User, contactId: number): Promise<AddressResponse[]> {
    await this.contactService.checkContactMustExist(user.username, contactId);

    const addresses = await this.prisma.address.findMany({
      where: { contactId },
    });

    return addresses.map((address) => this.toAddressResponse(address));
  }
}
