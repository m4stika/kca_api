import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';
import { ContactModule } from './member/member.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ContactModule, AddressModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
