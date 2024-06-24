import { Module } from '@nestjs/common';
import { SimpananController } from './simpanan.controller';
import { SimpananService } from './simpanan.service';

@Module({
  controllers: [SimpananController],
  providers: [SimpananService],
})
export class SimpananModule {}

// nest generate mo simpanan --no-spec
// nest generate co simpanan simpanan --no-spec --flat
// nest generate s simpanan simpanan --no-spec --flat
