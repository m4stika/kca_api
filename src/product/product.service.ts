import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Barang, Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateProductRequest,
  ProductResponse,
  ProductValidation,
  SearchProductRequest,
  UpdateProductRequest,
} from 'src/schema/product.schema';
import { Logger } from 'winston';

@Injectable()
export class ProductService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  toProductResponse(product: Barang): Omit<ProductResponse, 'User'> {
    return {
      kodeBarang: product.kodeBarang,
      barcode: product.barcode,
      namaJenis: product.namaJenis,
      namaBarang: product.namaBarang,
      satuan: product.satuan,
      stok: product.stok,
      hargaJual: product.hargaJual,
    };
  }

  async checkProductrMustExist(
    username: string,
    productId?: string,
  ): Promise<ProductResponse> {
    const product = await this.prisma.barang.findFirst({
      where: { kodeBarang: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(
    user: User,
    request: CreateProductRequest,
  ): Promise<ProductResponse> {
    // const createRequest = this.validationService.validate<CreateProductRequest>(
    //   ProductValidation.CREATE,
    //   request,
    // );

    const requestValidation = {
      ...request,
      stok: new Prisma.Decimal(request.stok),
      hargaJual: new Prisma.Decimal(request.hargaJual),
    };

    const product = await this.prisma.barang.create({
      data: { ...requestValidation },
    });

    // const ProductResponse = this.toProductResponse(anggota);
    return product;
  }

  async get(user: User, productId: string): Promise<ProductResponse> {
    const product = await this.checkProductrMustExist(user.username, productId);

    return product; //this.toProductResponse(contact);
  }

  async update(
    user: User,
    request: UpdateProductRequest,
  ): Promise<ProductResponse> {
    // const updateRequest: UpdateProductRequest = this.validationService.validate(
    //   ProductValidation.UPDATE,
    //   request,
    // );

    const productExists = await this.checkProductrMustExist(
      user.username,
      request.kodeBarang,
    );

    const product = await this.prisma.barang.update({
      where: { kodeBarang: productExists.kodeBarang },
      data: {
        ...request,
        stok: new Prisma.Decimal(request.stok),
        hargaJual: new Prisma.Decimal(request.hargaJual),
      },
    });

    return product; // this.toProductResponse(contact);
  }

  async remove(user: User, productId: string): Promise<ProductResponse> {
    const productExists = await this.checkProductrMustExist(
      user.username,
      productId,
    );

    const contact = await this.prisma.barang.delete({
      where: { kodeBarang: productExists.kodeBarang },
    });

    return this.toProductResponse(contact);
  }

  async search(
    user: User,
    request: SearchProductRequest,
  ): Promise<ApiResponse<ProductResponse[]>> {
    const searchRequest: SearchProductRequest = this.validationService.validate(
      ProductValidation.SEARCH,
      request,
    );

    const filter: Prisma.BarangWhereInput[] = [];

    if (searchRequest.kodeBarang) {
      // add name filter
      filter.push({
        OR: [{ kodeBarang: { contains: searchRequest.kodeBarang } }],
      });
    }
    if (searchRequest.namaBarang) {
      // add name email
      filter.push({ namaBarang: { contains: searchRequest.namaBarang } });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const products = await this.prisma.barang.findMany({
      where: { AND: filter },
      take: searchRequest.size,
      skip,
    });

    const total = await this.prisma.anggota.count({
      where: { noAnggota: user.username, AND: filter },
    });

    return {
      status: 'success',
      // data: products.map((contact) => this.toProductResponse(contact)),
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
