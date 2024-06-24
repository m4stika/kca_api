import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreatePinjamanRequest,
  PinjamanResponse,
  PinjamanValidation,
  SearchPinjamanRequest,
  UpdatePinjamanRequest,
} from 'src/schema/pinjaman.schema';
import { Logger } from 'winston';

@Injectable()
export class PinjamanService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  /* toPinjamanResponse(product: Barang): Omit<PinjamanResponse, 'User'> {
    return {
      kodeBarang: product.kodeBarang,
      barcode: product.barcode,
      namaJenis: product.namaJenis,
      namaBarang: product.namaBarang,
      satuan: product.satuan,
      stok: product.stok,
      hargaJual: product.hargaJual,
    };
  } */

  async getPinjamanTerbayar(refCode: string) {
    const saldoTerbayar = await this.prisma.rincianPinjaman.aggregate({
      where: { refCode, lunas: 'L' },
      _sum: { rpBayar: true },
    });

    const result = new Prisma.Decimal(0);

    if (saldoTerbayar._sum.rpBayar) result.add(saldoTerbayar._sum.rpBayar);

    return result;
  }

  async checkPinjamanMustExist(refCode?: string): Promise<PinjamanResponse> {
    const pinjaman = await this.prisma.pinjaman.findUnique({
      where: { refCode },
    });

    if (!pinjaman) {
      throw new NotFoundException('pinjaman not found');
    }

    const terbayar = await this.getPinjamanTerbayar(pinjaman.refCode);

    return {
      ...pinjaman,
      terbayar,
      sisa: pinjaman.nilaiPinjaman.minus(terbayar),
    };
  }

  async create(
    user: User,
    request: CreatePinjamanRequest,
  ): Promise<PinjamanResponse> {
    // const createRequest = this.validationService.validate<CreatePinjamanRequest>(
    //   PinjamanValidation.CREATE,
    //   request,
    // );

    const requestValidation: CreatePinjamanRequest = {
      ...request,
      tglPinjam: new Date(request.tglPinjam),
      nilaiPinjaman: new Prisma.Decimal(request.nilaiPinjaman),
      persenBunga: new Prisma.Decimal(request.persenBunga),
      biayaAdmin: new Prisma.Decimal(request.biayaAdmin),
    };

    const pinjaman = await this.prisma.pinjaman.create({
      data: { ...requestValidation },
    });

    const terbayar = await this.getPinjamanTerbayar(pinjaman.refCode);

    return {
      ...pinjaman,
      terbayar,
      sisa: pinjaman.nilaiPinjaman.minus(terbayar),
    };
  }

  async get(refCode: string): Promise<PinjamanResponse> {
    const pinjaman = await this.checkPinjamanMustExist(refCode);

    return pinjaman; //this.toPinjamanResponse(contact);
  }

  async getByAnggota(noAnggota: string): Promise<PinjamanResponse[]> {
    const pinjaman = await this.prisma.pinjaman.findMany({
      where: { noAnggota, lunas: 'N' },
      include: { RincianPinjaman: { where: { lunas: 'L' } } },
    });

    if (!pinjaman) {
      throw new NotFoundException('pinjaman not found');
    }

    const pinjamanResult = await Promise.all(
      pinjaman.map(async (item) => {
        const terbayar = await this.getPinjamanTerbayar(item.refCode);
        return {
          ...item,
          terbayar,
          sisa: item.nilaiPinjaman.minus(terbayar),
          RincianPinjaman: item.RincianPinjaman,
        };
      }),
    );

    return pinjamanResult;
  }

  async update(
    user: User,
    request: UpdatePinjamanRequest,
  ): Promise<PinjamanResponse> {
    // const updateRequest: UpdatePinjamanRequest = this.validationService.validate(
    //   PinjamanValidation.UPDATE,
    //   request,
    // );

    const pinjamanExists = await this.checkPinjamanMustExist(request.refCode);

    const pinjaman = await this.prisma.pinjaman.update({
      where: { refCode: pinjamanExists.refCode },
      data: {
        ...request,
        tglPinjam: new Date(request.tglPinjam),
        nilaiPinjaman: new Prisma.Decimal(request.nilaiPinjaman),
        persenBunga: new Prisma.Decimal(request.persenBunga),
        biayaAdmin: new Prisma.Decimal(request.biayaAdmin),
      },
    });

    return {
      ...pinjaman,
      terbayar: pinjamanExists.terbayar,
      sisa: pinjamanExists.sisa,
    }; // this.toPinjamanResponse(contact);
  }

  async remove(refCode: string): Promise<string> {
    const pinjamanExists = await this.checkPinjamanMustExist(refCode);

    await this.prisma.pinjaman.delete({
      where: { refCode: pinjamanExists.refCode },
    });

    return `${refCode} has been Deleted`;
  }

  async search(
    user: User,
    request: SearchPinjamanRequest,
  ): Promise<ApiResponse<Omit<PinjamanResponse, 'terbayar' | 'sisa'>[]>> {
    const searchRequest: SearchPinjamanRequest =
      this.validationService.validate(PinjamanValidation.SEARCH, request);

    const filter: Prisma.PinjamanWhereInput[] = [];

    if (searchRequest.noAnggota) {
      // add name filter
      filter.push({
        OR: [{ noAnggota: { contains: searchRequest.noAnggota } }],
      });
    }
    if (searchRequest.namaAnggota) {
      // add name email
      filter.push({
        Anggota: { namaAnggota: { contains: searchRequest.namaAnggota } },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const products = await this.prisma.pinjaman.findMany({
      where: { AND: filter },
      take: searchRequest.size,
      skip,
    });

    const total = await this.prisma.pinjaman.count({
      where: { AND: filter },
    });

    return {
      status: 'success',
      // data: products.map((contact) => this.toPinjamanResponse(contact)),
      data: products,
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
