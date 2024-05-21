import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async deleteUsers() {
    await this.prisma.user.deleteMany({
      where: { username: 'mastika' },
    });
  }

  async createUser() {
    await this.prisma.user.create({
      data: {
        username: 'mastika',
        name: 'mastika',
        email: 'mastika@gmail.com',
        password: await bcrypt.hash('811899', 10),
      },
    });
  }
}
