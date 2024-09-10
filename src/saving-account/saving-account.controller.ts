// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Inject,
//   Param,
//   ParseIntPipe,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { AuthGuard } from 'src/auth/auth.guard';
// import {
//   CreateSavingAccountRequest,
//   SavingAccountResponse,
// } from 'src/schema/saving-account.schema';
// import { Logger } from 'winston';
// import { SavingAccountService } from './saving-account.service';
//
// @Controller('saving-account')
// export class SavingAccountController {
//   constructor(
//     private savingAccountService: SavingAccountService,
//     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
//   ) {}
//
//   @UseGuards(AuthGuard)
//   @Post()
//   @HttpCode(HttpStatus.OK)
//   async create(
//     @Body() request: CreateSavingAccountRequest,
//   ): Promise<ApiResponse<SavingAccountResponse>> {
//     this.logger.debug(
//       `Controller.saving-account.create ${JSON.stringify({ ...request }, undefined, 3)}`,
//     );
//     const result = await this.savingAccountService.create(request);
//     return {
//       status: 'success',
//       data: result,
//     };
//   }
//
//   @UseGuards(AuthGuard)
//   @Get(':id')
//   @HttpCode(HttpStatus.OK)
//   async get(
//     @Param('id', ParseIntPipe) id: number,
//   ): Promise<ApiResponse<SavingAccountResponse>> {
//     this.logger.debug(
//       `Controller.saving-account.get ${JSON.stringify({ id })}`,
//     );
//     const result = await this.savingAccountService.findOne(id);
//     return {
//       status: 'success',
//       data: result,
//     };
//   }
// }
