import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderRequest,
} from 'src/schema/order.schema';
import { ProductResponse } from 'src/schema/product.schema';
import { Logger } from 'winston';

@Injectable()
export class OrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) { }

  // toOrderResponse(product: Barang): Omit<OrderResponse, 'User'> {
  //   return {
  //     kodeBarang: product.kodeBarang,
  //     barcode: product.barcode,
  //     namaJenis: product.namaJenis,
  //     namaBarang: product.namaBarang,
  //     satuan: product.satuan,
  //     stok: product.stok,
  //     hargaJual: product.hargaJual,
  //   };
  // }

  // create kasbank autonumber
  async invoiceAutoNumber(): Promise<string | null> {
    // output --> INV202212310001
    // output --> PEN2023001

    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const day = new Date().getDate().toString().padStart(2, '0');

    const order = await this.prisma.order.findFirst({
      where: { invoiceNo: { contains: year.toString() } },
      orderBy: { invoiceNo: 'desc' },
      select: { invoiceNo: true },
    });

    let lastNo = 0;
    if (order && order.invoiceNo) lastNo = parseInt(order.invoiceNo.slice(11));
    if (Number.isNaN(lastNo)) return null; //`INV${year}${month}${day}001`;

    lastNo = !lastNo || lastNo >= 0 ? lastNo + 1 : 1;
    return `INV${year}${month}${day}${lastNo.toString().padStart(3, '0')}`;
  }

  async checkProductMustExist(productId: string): Promise<ProductResponse> {
    const product = await this.prisma.barang.findUnique({
      where: { kodeBarang: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async checkOrderMustExist(id: number): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { OrderDetail: { include: { Barang: true } } },
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return order;
  }

  async create(request: CreateOrderRequest): Promise<OrderResponse> {
    // const createRequest = this.validationService.validate<CreateOrderRequest>(
    //   OrderValidation.CREATE,
    //   request,
    // );

    // console.log('request', request)

    const { Anggota, OrderDetail, ...newData } = request;
    const requestValidation = {
      ...newData,
      transactionDate: new Date(newData.transactionDate),
      amount: new Prisma.Decimal(newData.amount),
    };

    const newOrderDetail = OrderDetail.map((item, index) => ({
      ...item,
      parentId: undefined,
      index: ++index,
      price: new Prisma.Decimal(item.price),
    }));

    const invoiceNo = await this.invoiceAutoNumber();
    if (!invoiceNo) throw new ConflictException('Error Generate Invoice');

    const order = await this.prisma.order.create({
      data: {
        ...requestValidation,
        invoiceNo,
        orderStatus: 'ON_VERIFICATION',
        OrderDetail: { createMany: { data: newOrderDetail } },
      },
      include: { OrderDetail: { include: { Barang: true } } },
    });

    // const OrderResponse = this.toOrderResponse(anggota);
    return order;
  }

  async get(id: number): Promise<OrderResponse> {
    const order = await this.checkOrderMustExist(id);

    return order; //this.toOrderResponse(contact);
  }

  async getByMember(noAnggota: string, orderStatus: string | undefined): Promise<OrderResponse[]> {
    const order = await this.prisma.order.findMany({
      where: { noAnggota: noAnggota, orderStatus },
      include: { OrderDetail: { include: { Barang: true } } },
    });

    if (!order) throw new NotFoundException('order not found');

    return order; //this.toOrderResponse(contact);
  }

  async getPreOrder(noAnggota: string): Promise<OrderResponse | null> {
    return await this.prisma.order.findFirst({
      where: { noAnggota: noAnggota, orderStatus: 'PRE-ORDER' },
      include: { OrderDetail: { include: { Barang: true } } },
    });

    // if (!order) throw new NotFoundException('order not found');
  }

  async update(
    id: number,
    request: UpdateOrderRequest,
  ): Promise<OrderResponse> {
    // const updateRequest: UpdateOrderRequest = this.validationService.validate(
    //   OrderValidation.UPDATE,
    //   request,
    // );

    await this.checkOrderMustExist(id);

    const { Anggota, OrderDetail, ...newData } = request;
    const requestValidation = {
      ...newData,
      transactionDate: new Date(newData.transactionDate),
      amount: new Prisma.Decimal(newData.amount),
    };

    const newOrderDetail = OrderDetail.map((item, index) => ({
      ...item,
      parentId: undefined,
      index: index++,
      price: new Prisma.Decimal(item.price),
    }));

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...requestValidation,
        OrderDetail: {
          deleteMany: {},
          createMany: { data: newOrderDetail },
        },
      },
      include: { OrderDetail: { include: { Barang: true } } },
    });

    return order; // this.toOrderResponse(contact);
  }

  async remove(id: number): Promise<string> {
    await this.checkOrderMustExist(id);

    await this.prisma.order.delete({
      where: { id },
    });

    return 'Data has been deleted';
  }

  async cancel(id: number): Promise<string> {
    await this.checkOrderMustExist(id);

    await this.prisma.order.update({
      where: { id },
      data: { orderStatus: "CANCELED" }
    });

    return 'Data has been canceled';
  }
  /*
  async search(
    user: User,
    request: SearchOrderRequest,
  ): Promise<ApiResponse<OrderResponse[]>> {
    const searchRequest: SearchOrderRequest = this.validationService.validate(
      OrderValidation.SEARCH,
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

    const total = await this.prisma.barang.count({
      where: { AND: filter },
    });

    return {
      status: 'success',
      // data: products.map((contact) => this.toOrderResponse(contact)),
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
   */
}
