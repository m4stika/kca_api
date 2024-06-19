import { Module } from '@nestjs/common';
import { ContactController } from './member.controller';
import { ContactService } from './member.service';

@Module({
  providers: [ContactService],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}
