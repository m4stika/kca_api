import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SavingAccount } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { MemberResponse } from 'src/schema/member.schema';
import {
  CreateSavingAccountRequest,
  SavingAccountResponse,
  SavingAccountValidation,
} from 'src/schema/saving-account.schema';
import { Logger } from 'winston';
import { ZodType } from 'zod';

@Injectable()
export class SavingAccountService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  async checkMemberMustExist(memberId: number): Promise<MemberResponse> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId },
      include: { User: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async checkRecordMustExist(id: number): Promise<SavingAccount> {
    const savingAccount = await this.prisma.savingAccount.findFirst({
      where: { id },
    });

    if (!savingAccount) {
      throw new NotFoundException(`Saving-account with id# ${id} not found`);
    }

    return savingAccount;
  }

  async create(
    request: CreateSavingAccountRequest,
  ): Promise<SavingAccountResponse> {
    const createRequest: CreateSavingAccountRequest =
      this.validationService.validate<CreateSavingAccountRequest>(
        SavingAccountValidation.CREATE as ZodType,
        request,
      );

    const Member = await this.checkMemberMustExist(createRequest.memberId);
    const savingAmount = createRequest.principalDeposit
      .plus(createRequest.mandatoryDeposit)
      .plus(createRequest.voluntaryDeposit || 0)
      .plus(createRequest.otherDeposit || 0);
    const withdrawalLimit = createRequest.voluntaryWithdrawalLimit.plus(
      createRequest.otherWithdrawalLimit,
    );

    const savingAccount = await this.prisma.savingAccount.create({
      data: {
        ...createRequest,
        savingAmount,
        withdrawalLimit,
        memberId: Member.id,
      },
      // include: { User: true },
    });

    // const MemberResponse = this.toMemberResponse(contact);
    return { ...savingAccount, Member };
  }

  async findOne(id: number): Promise<SavingAccountResponse> {
    const savingAccount = await this.checkRecordMustExist(id);
    const Member = await this.checkMemberMustExist(savingAccount.memberId);

    return { ...savingAccount, Member };
  }
}
