import { Module } from '@nestjs/common';
import { TokenService } from 'src/common/token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [TokenService, AuthService],
  exports: [TokenService, AuthService],
})
export class AuthModule {}
