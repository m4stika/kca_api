import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Auth } from 'src/auth/auth.decorator';
import {
  CreateProductRequest,
  ProductResponse,
  SearchProductRequest,
  UpdateProductRequest,
} from 'src/schema/product.schema';
import { Logger } from 'winston';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateProductRequest,
  ): Promise<ApiResponse<ProductResponse>> {
    this.logger.debug(
      `Controller.product.create ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.productService.create(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Auth() user: User,
    @Query('namaBarang') namaBarang?: string,
    @Query('kodeBarang') kodeBarang?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<ApiResponse<ProductResponse[]>> {
    this.logger.debug(
      `Controller.product.search ${JSON.stringify({ username: user.username, namaBarang, kodeBarang, page, size })}`,
    );
    const member: SearchProductRequest = {
      kodeBarang,
      namaBarang,
      page: page || 1,
      size: size || 10,
    };
    return await this.productService.search(user, member);
  }


  @Get(':productId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('productId') productId: string,
  ): Promise<ApiResponse<ProductResponse>> {
    this.logger.debug(
      `Controller.product.get ${JSON.stringify({ username: user.username, productId })}`,
    );
    const result = await this.productService.get(user, productId);
    return {
      status: 'success',
      data: result,
    };
  }

  @Put(':productId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Body() request: UpdateProductRequest,
    @Param('productId') productId: string,
  ): Promise<ApiResponse<ProductResponse>> {
    request.kodeBarang = productId;
    this.logger.debug(
      `Controller.product.update ${JSON.stringify({ ...request, username: user.username })}`,
    );
    const result = await this.productService.update(user, request);
    return {
      status: 'success',
      data: result,
    };
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('productId') productId: string,
  ): Promise<ApiResponse<string>> {
    this.logger.debug(
      `Controller.product.delete ${JSON.stringify({ username: user.username, productId })}`,
    );
    await this.productService.remove(user, productId);
    return {
      status: 'success',
      data: 'Contact has been deleted',
    };
  }
}
