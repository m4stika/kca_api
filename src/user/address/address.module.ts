import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [ContactModule],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
