import { Module } from '@nestjs/common';
import { SavingAccountController } from './saving-account.controller';
import { SavingAccountService } from './saving-account.service';

@Module({
  controllers: [SavingAccountController],
  providers: [SavingAccountService],
})
export class SavingAccountModule {}
