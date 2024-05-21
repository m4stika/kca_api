import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.debug('AuthGuard: UnauthorizedException');
      throw new UnauthorizedException();
    }
    return true;
  }
}
