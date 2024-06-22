import { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcrypt';
// import { CoA } from '../rest-api/seed-data/chart-of-account';

// initialize Prisma Client
const prisma = new PrismaClient();

const updateUserPassword = async () => {
  const usersFromDb = await prisma.user.findMany();
  if (usersFromDb) {
    usersFromDb.map((item) => ({ ...item, password: item.name }));
  }

  const dataResult = await Promise.all(
    usersFromDb.map(async (item) => ({
      ...item,
      password: await hash(item.password, 10),
    })),
  );

  await prisma.$transaction(async (tx) => {
    for (const user of dataResult) {
      await tx.user.update({
        where: { username: user.username },
        data: { password: user.password },
      });
    }
  });
};

const generateUser = async () => {
  const usersFromDb = await prisma.user.findMany();
  const contacts = await prisma.member.findMany();
  if (usersFromDb) {
    usersFromDb.map((item) => ({ ...item, password: item.name }));
  }

  const usersData: User[] = usersFromDb
    ? usersFromDb
    : [
        {
          username: 'admin',
          email: 'admin@gmail.com',
          password: 'admin',
          name: 'admin',
        },
        {
          username: 'super-admin',
          email: 'root@gmail.com',
          password: 'super',
          name: 'super admin',
        },
      ];

  const dataResult = await Promise.all(
    usersData.map(async (item) => ({
      ...item,
      password: await hash(item.password, 10),
    })),
  );

  console.log('start seeding users..');

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany();
    await tx.user.createMany({ data: dataResult });
    await tx.member.createMany({
      data: contacts.map((item) => ({ ...item, id: undefined })),
    });

    // for (const user of dataResult) {
    //   await prisma.user.create({ data: user });
    // }
  });

  console.log('seeding users done!');
};

async function main() {
  if (process.env.NODE_ENV !== 'development') return;
  // await removeAllRecords();
  // await generateUser();
  await updateUserPassword();
  // await generateEmployee();
  // await generateCustomer();
  // await generateTypes();
  // await generateChartOfAccount();
  // await generateFixedAssetType();
  // await generateParameters();
  // await generateUnits();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
