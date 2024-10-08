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
  ) { }

  toAnggotaResponse(
    anggota: Anggota,
  ): Omit<AnggotaResponse, 'User' | 'saldoSimpanan' | 'saldoPinjaman' | 'saldoSimpananSukarela'> {
    // get saldo simpanan

    return {
      noAnggota: anggota.noAnggota,
      nip: anggota.nip,
      NIK: anggota.NIK,
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
    const saldoSimpanan = await this.prisma.simpanan.findUnique({
      where: { noAnggota: noAnggota.toString() },
      select: { totalSaldo: true, sisaSukarela: true },
    });

    // const saldoPinjaman = await this.prisma.pinjaman.aggregate({
    //   where: { noAnggota: noAnggota.toString(), lunas: 'N' },
    //   _sum: { nilaiPinjaman: true },
    // });

    const dataPinjaman = await this.prisma.pinjaman.findMany({
      where: { noAnggota: noAnggota.toString(), lunas: 'N', verificationStatus: "APPROVED" },
      select: { refCode: true, nilaiPinjaman: true },
    });
    const result = {
      saldoSimpanan: new Prisma.Decimal(0),
      saldoSimpananSukarela: new Prisma.Decimal(0),
      saldoPinjaman: new Prisma.Decimal(0),
      nilaiAngsuran: new Prisma.Decimal(0),
    };

    if (dataPinjaman) {
      await Promise.all(
        dataPinjaman.map(async (pinjaman) => {
          // const result = {
          //   pinjaman: new Prisma.Decimal(0),
          //   angsuran: new Prisma.Decimal(0),
          // };

          result.saldoPinjaman = result.saldoPinjaman.add(
            pinjaman.nilaiPinjaman,
          );

          const rincianPinjaman = await this.prisma.rincianPinjaman.findFirst({
            where: { refCode: pinjaman.refCode, lunas: 'N' },
            select: { rpPinjaman: true, rpBunga: true },
          });
          if (rincianPinjaman)
            result.nilaiAngsuran = result.nilaiAngsuran
              .add(rincianPinjaman.rpPinjaman)
              .add(rincianPinjaman.rpBunga);

          // return result;
        }),
      );
    }

    if (saldoSimpanan) {
      result.saldoSimpanan = result.saldoSimpanan.add(saldoSimpanan.totalSaldo);
      result.saldoSimpananSukarela = result.saldoSimpananSukarela.add(saldoSimpanan.sisaSukarela)

    }

    // if (saldoPinjaman._sum.nilaiPinjaman)
    //   result.saldoPinjaman = result.saldoPinjaman.add(
    //     saldoPinjaman._sum.nilaiPinjaman,
    //   );

    return result;
  }

  async checkMemberMustExist(
    username: string,
    noAnggota?: string,
  ): Promise<
    Omit<AnggotaResponse, 'saldoSimpanan' | 'saldoPinjaman' | 'nilaiAngsuran' | 'saldoSimpananSukarela'>
  > {
    const anggota = await this.prisma.anggota.findFirst({
      where: { noAnggota: username },
      include: { User: true },
    });

    if (!anggota) {
      throw new NotFoundException('Contact not found');
    }

    if (!anggota.User) throw new NotFoundException("User not registered")

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
    const { saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela };
  }

  async get(user: User, contactId: string): Promise<AnggotaResponse> {
    const anggota = await this.checkMemberMustExist(user.memberId, contactId);
    const { saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela };
  }

  async find(user: User): Promise<AnggotaResponse> {
    const anggota = await this.checkMemberMustExist(user.memberId);

    const { saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela } = await this.getSaldo(
      anggota.noAnggota,
    );
    return { ...anggota, saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela };
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
      user.memberId,
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

    const { saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela } = await this.getSaldo(
      member.noAnggota,
    );
    return { ...member, saldoPinjaman, saldoSimpanan, nilaiAngsuran, saldoSimpananSukarela };
  }

  async remove(
    user: User,
    contactId: string,
  ): Promise<
    Omit<AnggotaResponse, 'User' | 'saldoSimpanan' | 'saldoPinjaman' | 'saldoSimpananSukarela'>
  > {
    const memberExists = await this.checkMemberMustExist(
      user.memberId,
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
    ApiResponse<Omit<AnggotaResponse, 'saldoSimpanan' | 'saldoPinjaman' | 'saldoSimpananSukarela'>[]>
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
      where: { noAnggota: user.memberId, AND: filter },
      take: searchRequest.size,
      skip,
      include: { User: true },
    });

    const total = await this.prisma.anggota.count({
      where: { noAnggota: user.memberId, AND: filter },
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

  async promotion(): Promise<unknown> {
    const result = await this.prisma.promotion.findMany({ where: { active: true } })
    return result
  }
}
