import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SavingAccountModule } from './saving-account/saving-account.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AnggotaModule } from './anggota/anggota.module';
import { SimpananModule } from './simpanan/simpanan.module';
import { PinjamanModule } from './pinjaman/pinjaman.module';
import { OrderModule } from './order/order.module';
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

const rootPath = isProduction
  ? join(__dirname, 'public', 'assets')  // Untuk production, file berada di dalam dist
  : join(__dirname, '..', 'public', 'assets');  // Untuk development, file berada di luar src

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, 'public', 'assets'), // Path ke folder yang berisi file static
      rootPath,
      serveRoot: '/assets', // Optional, menentukan path di URL untuk akses file
      serveStaticOptions: { index: false, redirect: false },
      exclude: ['/api/(.*)'],
    }),
    CommonModule, UserModule, SavingAccountModule, ProductModule, AnggotaModule, SimpananModule, PinjamanModule, OrderModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { } 
