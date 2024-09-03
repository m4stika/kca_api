import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { TSession, UserResponse } from 'src/schema/user.schema';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  findOne = async (username: string): Promise<UserResponse> => {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        password: true,
        name: true,
        email: true,
        memberId: true,
        NIK: true,
        phone: true,
        // Roles: true,
        sessions: { where: { username, valid: true }, take: 1 },
      },
    });

    if (!user) {
      throw new NotFoundException(`${username} is not found`);
    }

    const session = user.sessions[0];

    // const userRoles = user.Roles.map(({ role }) => role);

    return {
      username: user.username,
      name: user.name,
      email: user.email,
      memberId: user.memberId,
      NIK: user.NIK,
      phone: user.phone,
      // Roles: userRoles,
      session: session,
    };
  };

  // list user
  findAll = async (): Promise<UserResponse[]> => {
    const users = await this.prisma.user.findMany({
      select: {
        username: true,
        email: true,
        name: true,
        memberId: true,
        NIK: true,
        phone: true,
        sessions: {
          where: { valid: true },
          select: {
            id: true,
            valid: true,
            username: true,
          },
        },
        // Roles: { select: { role: true } },
        // UserModule: { select: { appModule: true } },
      },
    });
    const result = users.map((user) => {
      // const { sessions, Roles, ...others } = user;
      const { sessions, ...others } = user;
      // const userRoles = Roles.map(({ role }) => role);
      // const modules = UserModule.map(({ appModule }) => AppModuleObject[appModule]);
      return {
        ...others,
        session: sessions[0],
        // sessions,
        // Roles: userRoles,
        // UserModule: modules,
      };
    });

    return result;
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
