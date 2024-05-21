import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Contact, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  ContactResponse,
  ContactValidation,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/schema/contact.schema';
import { Logger } from 'winston';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  toContactResponse(contact: Contact): Omit<ContactResponse, 'User'> {
    return {
      memberId: contact.memberId,
      id: contact.id,
      username: contact.username,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      NIP: contact.NIP,
      memberTypeId: contact.memberTypeId,
      unitId: contact.unitId,
      subUnitId: contact.subUnitId,
    };
  }

  async checkContactMustExist(
    username: string,
    contactId: number,
  ): Promise<ContactResponse> {
    const contact = await this.prisma.contact.findFirst({
      where: { username, id: contactId },
      include: { User: true },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact = await this.prisma.contact.create({
      data: { ...createRequest, username: user.username },
      include: { User: true },
    });

    // const contactResponse = this.toContactResponse(contact);
    return contact;
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    const contact = await this.checkContactMustExist(user.username, contactId);

    return contact; //this.toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const updateRequest: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    let contact = await this.checkContactMustExist(
      user.username,
      updateRequest.id,
    );

    contact = await this.prisma.contact.update({
      where: { id: contact.id, username: contact.username },
      data: updateRequest,
      include: { User: true },
    });

    return contact; // this.toContactResponse(contact);
  }

  async remove(
    user: User,
    contactId: number,
  ): Promise<Omit<ContactResponse, 'User'>> {
    const contactExists = await this.checkContactMustExist(
      user.username,
      contactId,
    );

    const contact = await this.prisma.contact.delete({
      where: { id: contactExists.id, username: contactExists.username },
    });

    return this.toContactResponse(contact);
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<ApiResponse<ContactResponse[]>> {
    const searchRequest: SearchContactRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filter = [];

    if (searchRequest.name) {
      // add name filter
      filter.push({
        OR: [
          { firstName: { contains: searchRequest.name } },
          { lastName: { contains: searchRequest.name } },
        ],
      });
    }
    if (searchRequest.email) {
      // add name email
      filter.push({ email: { contains: searchRequest.email } });
    }
    if (searchRequest.phone) {
      // add name phone
      filter.push({ phone: { contains: searchRequest.phone } });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const contacts = await this.prisma.contact.findMany({
      where: { username: user.username, AND: filter },
      take: searchRequest.size,
      skip,
      include: { User: true },
    });

    const total = await this.prisma.contact.count({
      where: { username: user.username, AND: filter },
    });

    return {
      status: 'success',
      // data: contacts.map((contact) => this.toContactResponse(contact)),
      data: contacts,
      paging: {
        totalRows: total,
        totalPages: Math.ceil(total / searchRequest.size),
        rowPerPage: searchRequest.size,
        page: searchRequest.page,
        previous: searchRequest.page <= 1 ? 1 : searchRequest.page - 1,
        next: searchRequest.page + 1,
        hasMore: true,
      },
    };
  }
}
