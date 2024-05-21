import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { TokenService } from 'src/common/token.service';
import { ValidationService } from 'src/common/validation.service';
import {
  TSession,
  UserLoginRequest,
  UserRegisterRequest,
  UserValidation,
  UserWithToken,
} from 'src/schema/user.schema';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  register = async (
    request: UserRegisterRequest & { userAgent: string },
  ): Promise<UserWithToken> => {
    this.logger.debug(`UserService.Register(${JSON.stringify(request)})`);
    const { userAgent, ...newUser } = request;
    this.validationService.validate(UserValidation.REGISTER, newUser);

    const userInDatabase = await this.prisma.user.count({
      where: { username: newUser.username },
    });
    if (userInDatabase === 1)
      throw new ConflictException('username already registered');

    const emailInDatabase = await this.prisma.user.count({
      where: { email: newUser.email },
    });
    if (emailInDatabase)
      throw new ConflictException('email address already registered');

    const newInput = {
      ...newUser,
      confirmedPassword: undefined,
      sessions: undefined,
      password: await hash(newUser.password, 10),
      // password,
    };

    const user = await this.prisma.user.create({
      data: {
        ...newInput,
        sessions: {
          create: [{ userAgent: userAgent || '' }],
        },
        // Roles: {
        //   create: [{ role: Role.USER }],
        // },
        // UserModule: {
        //   create: [{ appModule: "Home" }],
        // },
      },
      select: {
        username: true,
        name: true,
        email: true,
        sessions: { select: { id: true, valid: true, username: true } },
        // Roles: { select: { role: true } },
        // UserModule: { select: { appModule: true } },
      },
    });

    const { sessions, ...neoUser } = user;
    // const userRoles = neoUser.Roles.map(({ role }) => role);
    // const modules = user.UserModule.map(({ appModule }) => AppModuleObject[appModule]);

    // const payload = { ...newUser, session: sessions[0], Roles: userRoles };
    const payload = { ...newUser, session: sessions[0] };
    const { accessToken, refreshToken } =
      await this.tokenService.signToken(payload);

    return { ...payload, accessToken, refreshToken };
  };

  login = async (
    request: UserLoginRequest & { userAgent: string },
  ): Promise<UserWithToken> => {
    this.logger.debug(`UserService.Login(${JSON.stringify(request)})`);
    const loginRequest = this.validationService.validate<UserLoginRequest>(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prisma.user.findUnique({
      where: { username: loginRequest.username },
      select: {
        username: true,
        password: true,
        name: true,
        email: true,
        // Roles: true,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('Username or password wrong..!');
    }

    const isPasswordValid = await compare(loginRequest.password, user.password);
    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Username or password wrong..!');
    }

    const session = await this.prisma.session.create({
      data: {
        username: user.username,
        userAgent: request.userAgent || '',
        valid: true,
      },
      select: { id: true, valid: true, username: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid email or password');
      // return "Invalid email or password";
    }

    // const userRoles = user.Roles.map(({ role }) => role);
    // const modules = user.UserModule.map(({ appModule }) => AppModuleObject[appModule]);
    const { password, ...newUser } = user;
    const payload = { ...newUser, session };
    const { accessToken, refreshToken } =
      await this.tokenService.signToken(payload);

    return { ...payload, accessToken, refreshToken };
  };

  logout = async (sessionId: string) => {
    if (!sessionId) throw new UnauthorizedException();
    const session = await this.prisma.session.count({
      where: { id: sessionId, valid: true },
    });
    if (!session) throw new UnauthorizedException();
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { valid: false },
    });
  };

  // get session
  getSession = async (id: string): Promise<TSession | false> => {
    const session = await this.prisma.session.findUnique({
      where: { id, valid: true },
    });
    if (!session) return false;
    return session;
  };
}
