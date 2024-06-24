import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateSimpananRequest,
  SearchSimpananRequest,
  SimpananResponse,
  SimpananValidation,
  UpdateSimpananRequest,
} from 'src/schema/simpanan.schema';
import { Logger } from 'winston';

@Injectable()
export class SimpananService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  /* toSimpananResponse(product: Barang): Omit<SimpananResponse, 'User'> {
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

  async checkSimpananMustExist(noAnggota?: string): Promise<SimpananResponse> {
    const simpanan = await this.prisma.simpanan.findFirst({
      where: { noAnggota },
    });

    if (!simpanan) {
      throw new NotFoundException('simpanan not found');
    }

    return simpanan;
  }

  async create(
    user: User,
    request: CreateSimpananRequest,
  ): Promise<SimpananResponse> {
    // const createRequest = this.validationService.validate<CreateSimpananRequest>(
    //   SimpananValidation.CREATE,
    //   request,
    // );

    const requestValidation = {
      ...request,
      totalPokok: new Prisma.Decimal(request.totalPokok),
      totalWajib: new Prisma.Decimal(request.totalWajib),
      sisaSukarela: new Prisma.Decimal(request.sisaSukarela),
      totalSaldo: new Prisma.Decimal(request.totalSaldo),
    };

    const simpanan = await this.prisma.simpanan.create({
      data: { ...requestValidation },
    });

    // const SimpananResponse = this.toSimpananResponse(anggota);
    return simpanan;
  }

  async get(noAnggota: string): Promise<SimpananResponse> {
    const simpanan = await this.checkSimpananMustExist(noAnggota);

    return simpanan; //this.toSimpananResponse(contact);
  }

  async update(
    user: User,
    request: UpdateSimpananRequest,
  ): Promise<SimpananResponse> {
    // const updateRequest: UpdateSimpananRequest = this.validationService.validate(
    //   SimpananValidation.UPDATE,
    //   request,
    // );

    const simpananExists = await this.checkSimpananMustExist(request.noAnggota);

    const simpanan = await this.prisma.simpanan.update({
      where: { noAnggota: simpananExists.noAnggota },
      data: {
        ...request,
        totalPokok: new Prisma.Decimal(simpananExists.totalPokok),
        totalWajib: new Prisma.Decimal(simpananExists.totalWajib),
        sisaSukarela: new Prisma.Decimal(simpananExists.sisaSukarela),
        totalSaldo: new Prisma.Decimal(simpananExists.totalSaldo),
      },
    });

    return simpanan; // this.toSimpananResponse(contact);
  }

  async remove(noAnggota: string): Promise<SimpananResponse> {
    const simpananExists = await this.checkSimpananMustExist(noAnggota);

    const simpanan = await this.prisma.simpanan.delete({
      where: { noAnggota: simpananExists.noAnggota },
    });

    return simpanan;
  }

  async search(
    user: User,
    request: SearchSimpananRequest,
  ): Promise<ApiResponse<SimpananResponse[]>> {
    const searchRequest: SearchSimpananRequest =
      this.validationService.validate(SimpananValidation.SEARCH, request);

    const filter: Prisma.SimpananWhereInput[] = [];

    if (searchRequest.noAnggota) {
      // add name filter
      filter.push({
        OR: [{ noAnggota: { contains: searchRequest.noAnggota } }],
      });
    }
    if (searchRequest.namaAnggota) {
      // add name email
      filter.push({ namaAnggota: { contains: searchRequest.namaAnggota } });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const products = await this.prisma.simpanan.findMany({
      where: { AND: filter },
      take: searchRequest.size,
      skip,
    });

    const total = await this.prisma.simpanan.count({
      where: { AND: filter },
    });

    return {
      status: 'success',
      // data: products.map((contact) => this.toSimpananResponse(contact)),
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
