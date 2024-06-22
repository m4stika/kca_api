import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SavingAccountModule } from './saving-account/saving-account.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AnggotaModule } from './anggota/anggota.module';

@Module({
  imports: [CommonModule, UserModule, SavingAccountModule, ProductModule, AnggotaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
