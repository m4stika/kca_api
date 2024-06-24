import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SavingAccountModule } from './saving-account/saving-account.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AnggotaModule } from './anggota/anggota.module';
import { SimpananModule } from './simpanan/simpanan.module';
import { PinjamanModule } from './pinjaman/pinjaman.module';

@Module({
  imports: [CommonModule, UserModule, SavingAccountModule, ProductModule, AnggotaModule, SimpananModule, PinjamanModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
