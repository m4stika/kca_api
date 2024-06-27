import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Auth } from 'src/auth/auth.decorator';
import {
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderRequest,
} from 'src/schema/order.schema';
import { Logger } from 'winston';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(
    private orderService: OrderService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateOrderRequest,
  ): Promise<ApiResponse<OrderResponse>> {
    this.logger.debug(
      `Controller.order.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.orderService.create(request);
    return {
      status: 'success',
      data: result,
    };
  }

  // @Get('search')
  // @HttpCode(HttpStatus.OK)
  // async search(
  //   @Auth() user: User,
  //   @Query('namaAnggota') namaAnggota?: string,
  //   @Query('noAnggota') noAnggota?: string,
  //   @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  //   @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  // ): Promise<ApiResponse<Omit<OrderResponse, 'terbayar' | 'sisa'>[]>> {
  //   this.logger.debug(
  //     `Controller.order.search ${JSON.stringify({ username: user.username, namaAnggota, noAnggota, page, size })}`,
  //   );
  //   const member: SearchOrderRequest = {
  //     noAnggota,
  //     namaAnggota,
  //     page: page || 1,
  //     size: size || 10,
  //   };
  //   return await this.orderService.search(user, member);
  // }

  @Get('by_member/:noAnggota')
  @HttpCode(HttpStatus.OK)
  async getByAnggota(
    @Auth() user: User,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<OrderResponse[]>> {
    this.logger.debug(
      `Controller.order.getByMember ${JSON.stringify({ username: user.username, noAnggota })}`,
    );
    const result = await this.orderService.getByMember(noAnggota);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('pre_order/:noAnggota')
  @HttpCode(HttpStatus.OK)
  async getPreOrder(
    @Auth() user: User,
    @Param('noAnggota') noAnggota: string,
  ): Promise<ApiResponse<OrderResponse | null>> {
    this.logger.debug(
      `Controller.order.getPreOrder ${JSON.stringify({ username: user.username, noAnggota })}`,
    );
    const result = await this.orderService.getPreOrder(noAnggota);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('id') id: number,
  ): Promise<ApiResponse<OrderResponse>> {
    this.logger.debug(
      `Controller.order.get ${JSON.stringify({ username: user.username, id })}`,
    );
    const result = await this.orderService.get(id);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdateOrderRequest,
    @Param('id') id: number,
  ): Promise<ApiResponse<OrderResponse>> {
    request.id = id;
    this.logger.debug(
      `Controller.order.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.orderService.update(id, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('id') id: number,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.order.delete ${JSON.stringify({ username: user.username, id })}`,
    );
    await this.orderService.remove(id);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }
}
