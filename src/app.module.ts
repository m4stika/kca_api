import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SavingAccountModule } from './saving-account/saving-account.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CommonModule, UserModule, SavingAccountModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
