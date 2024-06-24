import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Anggota, Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AnggotaResponse,
  AnggotaValidation,
  CreateAnggotaRequest,
  SearchAnggotaRequest,
  UpdateAnggotaRequest,
} from 'src/schema/anggota.schema';
import { Logger } from 'winston';

@Injectable()
export class AnggotaService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  toAnggotaResponse(
    anggota: Anggota,
  ): Omit<AnggotaResponse, 'User' | 'saldoSimpanan' | 'saldoPinjaman'> {
    // get saldo simpanan

    return {
      noAnggota: anggota.noAnggota,
      nip: anggota.nip,
      namaunit: anggota.namaunit,
      namasub: anggota.namasub,
      keterangan: anggota.keterangan,
      namaAnggota: anggota.namaAnggota,
      alamat: anggota.alamat,
      telp: anggota.telp,
      kelamin: anggota.kelamin,
      kodebank: anggota.kodebank,
      cabang: anggota.cabang,
      norek: anggota.norek,
      namarek: anggota.namarek,
      saldoVoucher: anggota.saldoVoucher,
    };
  }

  async getSaldo(noAnggota: string) {
    const saldoPinjaman = await this.prisma.pinjaman.aggregate({
      where: { noAnggota: noAnggota.toString(), lunas: 'N' },
      _sum: { nilaiPinjaman: true },
    });

    const saldoSimpanan = await this.prisma.simpanan.findUnique({
      where: { noAnggota: noAnggota.toString() },
      select: { totalSaldo: true },
    });

    const result = {
      saldoSimpanan: new Prisma.Decimal(0),
      saldoPinjaman: new Prisma.Decimal(0),
    };
    if (saldoSimpanan)
      result.saldoSimpanan = result.saldoSimpanan.add(saldoSimpanan.totalSaldo);

    if (saldoPinjaman._sum.nilaiPinjaman)
      result.saldoPinjaman = result.saldoPinjaman.add(
        saldoPinjaman._sum.nilaiPinjaman,
      );

    return result;
  }

  async checkMemberMustExist(
    username: string,
    noAnggota?: string,
  ): Promise<Omit<AnggotaResponse, 'saldoSimpanan' | 'saldoPinjaman'>> {
    const anggota = await this.prisma.anggota.findFirst({
      where: { noAnggota: username },
      include: { User: true },
    });

    if (!anggota) {
      throw new NotFoundException('Contact not found');
    }

    return anggota;
  }

  async create(
    user: User,
    request: CreateAnggotaRequest,
  ): Promise<AnggotaResponse> {
    const createRequest = this.validationService.validate<CreateAnggotaRequest>(
      AnggotaValidation.CREATE,
      request,
    );

    const requestValidation = {
      ...request,
      saldoVoucher: new Prisma.Decimal(request.saldoVoucher),
    };

    const anggota = await this.prisma.anggota.create({
      data: { ...requestValidation },
      include: { User: true },
    });

    // const AnggotaResponse = this.toAnggotaResponse(anggota);
    const { saldoPinjaman, saldoSimpanan } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan };
  }

  async get(user: User, contactId: string): Promise<AnggotaResponse> {
    const anggota = await this.checkMemberMustExist(user.username, contactId);
    const { saldoPinjaman, saldoSimpanan } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan };
  }

  async find(user: User): Promise<AnggotaResponse> {
    const anggota = await this.checkMemberMustExist(user.username);

    const { saldoPinjaman, saldoSimpanan } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan };
  }

  async update(
    user: User,
    request: UpdateAnggotaRequest,
  ): Promise<AnggotaResponse> {
    const updateRequest: UpdateAnggotaRequest = this.validationService.validate(
      AnggotaValidation.UPDATE,
      request,
    );

    const memberExists = await this.checkMemberMustExist(
      user.username,
      updateRequest.noAnggota,
    );

    const member = await this.prisma.anggota.update({
      where: { noAnggota: memberExists.noAnggota },
      data: {
        ...updateRequest,
        saldoVoucher: new Prisma.Decimal(updateRequest.saldoVoucher),
      },
      include: { User: true },
    });

    const { saldoPinjaman, saldoSimpanan } = await this.getSaldo(
      member.noAnggota,
    );
    return { ...member, saldoPinjaman, saldoSimpanan };
  }

  async remove(
    user: User,
    contactId: string,
  ): Promise<
    Omit<AnggotaResponse, 'User' | 'saldoSimpanan' | 'saldoPinjaman'>
  > {
    const memberExists = await this.checkMemberMustExist(
      user.username,
      contactId,
    );

    const contact = await this.prisma.anggota.delete({
      where: { noAnggota: memberExists.noAnggota },
    });

    return this.toAnggotaResponse(contact);
  }

  async search(
    user: User,
    request: SearchAnggotaRequest,
  ): Promise<
    ApiResponse<Omit<AnggotaResponse, 'saldoSimpanan' | 'saldoPinjaman'>[]>
  > {
    const searchRequest: SearchAnggotaRequest = this.validationService.validate(
      AnggotaValidation.SEARCH,
      request,
    );

    const filter = [];

    if (searchRequest.namaAnggota) {
      // add name filter
      filter.push({
        OR: [{ namaAnggota: { contains: searchRequest.namaAnggota } }],
      });
    }
    if (searchRequest.noAnggota) {
      // add name email
      filter.push({ noAnggota: { contains: searchRequest.noAnggota } });
    }
    if (searchRequest.telp) {
      // add name phone
      filter.push({ telp: { contains: searchRequest.telp } });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const contacts = await this.prisma.anggota.findMany({
      where: { noAnggota: user.username, AND: filter },
      take: searchRequest.size,
      skip,
      include: { User: true },
    });

    const total = await this.prisma.anggota.count({
      where: { noAnggota: user.username, AND: filter },
    });

    return {
      status: 'success',
      // data: contacts.map((contact) => this.toAnggotaResponse(contact)),
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
