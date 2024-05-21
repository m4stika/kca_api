import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Auth } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserResponse } from 'src/schema/user.schema';
import { Logger } from 'winston';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('current')
  @HttpCode(HttpStatus.OK)
  async get(@Auth() user: UserResponse) {
    this.logger.debug(`Controller.get.current ${user.username}`);
    // const result = await this.userService.get(user);
    return {
      status: 'success',
      data: user,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async findAll() {
    this.logger.debug(`Controller.getAll`);
    const result = await this.userService.findAll();
    return {
      status: 'success',
      data: result,
    };
  }
}
