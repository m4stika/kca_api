// import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { Member, Prisma, User } from '@prisma/client';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { PrismaService } from 'src/common/prisma.service';
// import { ValidationService } from 'src/common/validation.service';
// import {
//   CreateMemberRequest,
//   MemberResponse,
//   MemberValidation,
//   SearchMemberRequest,
//   UpdateMemberRequest,
// } from 'src/schema/member.schema';
// import { Logger } from 'winston';
//
// @Injectable()
// export class ContactService {
//   constructor(
//     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
//     private prisma: PrismaService,
//     private validationService: ValidationService,
//   ) {}
//
//   toMemberResponse(member: Member): Omit<MemberResponse, 'User'> {
//     return {
//       memberId: member.memberId,
//       id: member.id,
//       username: member.username,
//       firstName: member.firstName,
//       lastName: member.lastName,
//       email: member.email,
//       phone: member.phone,
//       NIP: member.NIP,
//       memberTypeId: member.memberTypeId,
//       unitId: member.unitId,
//       subUnitId: member.subUnitId,
//       voucherAmount: member.voucherAmount,
//     };
//   }
//
//   async checkMemberMustExist(
//     username: string,
//     memberId?: number,
//   ): Promise<MemberResponse> {
//     const contact = await this.prisma.member.findFirst({
//       where: { username, id: memberId ? memberId : undefined },
//       include: { User: true },
//     });
//
//     if (!contact) {
//       throw new NotFoundException('Contact not found');
//     }
//
//     return contact;
//   }
//
//   async create(
//     user: User,
//     request: CreateMemberRequest,
//   ): Promise<MemberResponse> {
//     const createRequest = this.validationService.validate<CreateMemberRequest>(
//       MemberValidation.CREATE,
//       request,
//     );
//
//     const requestValidation = {
//       ...request,
//       voucherAmount: new Prisma.Decimal(request.voucherAmount),
//     };
//
//     const contact = await this.prisma.member.create({
//       data: { ...requestValidation, username: user.username },
//       include: { User: true },
//     });
//
//     // const MemberResponse = this.toMemberResponse(contact);
//     return contact;
//   }
//
//   async get(user: User, contactId: number): Promise<MemberResponse> {
//     const contact = await this.checkMemberMustExist(user.username, contactId);
//
//     return contact; //this.toMemberResponse(contact);
//   }
//
//   async find(user: User): Promise<MemberResponse> {
//     const contact = await this.checkMemberMustExist(user.username);
//
//     return contact; //this.toMemberResponse(contact);
//   }
//
//   async update(
//     user: User,
//     request: UpdateMemberRequest,
//   ): Promise<MemberResponse> {
//     const updateRequest: UpdateMemberRequest = this.validationService.validate(
//       MemberValidation.UPDATE,
//       request,
//     );
//
//     const memberExists = await this.checkMemberMustExist(
//       user.username,
//       updateRequest.id,
//     );
//
//     const member = await this.prisma.member.update({
//       where: { id: memberExists.id, username: memberExists.username },
//       data: {
//         ...updateRequest,
//         voucherAmount: new Prisma.Decimal(updateRequest.voucherAmount),
//       },
//       include: { User: true },
//     });
//
//     return member; // this.toMemberResponse(contact);
//   }
//
//   async remove(
//     user: User,
//     contactId: number,
//   ): Promise<Omit<MemberResponse, 'User'>> {
//     const contactExists = await this.checkMemberMustExist(
//       user.username,
//       contactId,
//     );
//
//     const contact = await this.prisma.member.delete({
//       where: { id: contactExists.id, username: contactExists.username },
//     });
//
//     return this.toMemberResponse(contact);
//   }
//
//   async search(
//     user: User,
//     request: SearchMemberRequest,
//   ): Promise<ApiResponse<MemberResponse[]>> {
//     const searchRequest: SearchMemberRequest = this.validationService.validate(
//       MemberValidation.SEARCH,
//       request,
//     );
//
//     const filter = [];
//
//     if (searchRequest.name) {
//       // add name filter
//       filter.push({
//         OR: [
//           { firstName: { contains: searchRequest.name } },
//           { lastName: { contains: searchRequest.name } },
//         ],
//       });
//     }
//     if (searchRequest.email) {
//       // add name email
//       filter.push({ email: { contains: searchRequest.email } });
//     }
//     if (searchRequest.phone) {
//       // add name phone
//       filter.push({ phone: { contains: searchRequest.phone } });
//     }
//
//     const skip = (searchRequest.page - 1) * searchRequest.size;
//
//     const contacts = await this.prisma.member.findMany({
//       where: { username: user.username, AND: filter },
//       take: searchRequest.size,
//       skip,
//       include: { User: true },
//     });
//
//     const total = await this.prisma.member.count({
//       where: { username: user.username, AND: filter },
//     });
//
//     return {
//       status: 'success',
//       // data: contacts.map((contact) => this.toMemberResponse(contact)),
//       data: contacts,
//       paging: {
//         totalRows: total,
//         totalPages: Math.ceil(total / searchRequest.size),
//         rowPerPage: searchRequest.size,
//         page: searchRequest.page,
//         previous: searchRequest.page <= 1 ? 1 : searchRequest.page - 1,
//         next: searchRequest.page + 1,
//         hasMore: true,
//       },
//     };
//   }
// }
