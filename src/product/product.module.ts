import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

// nest generate mo product --no-spec
// nest generate co product product --no-spec --flat
// nest generate s product product --no-spec --flat
