import { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcrypt';
// import { CoA } from '../rest-api/seed-data/chart-of-account';

// initialize Prisma Client
const prisma = new PrismaClient();

const updateUserPassword = async () => {
  const usersFromDb = await prisma.user.findMany();
  // if (usersFromDb) {
  const userWithPass = usersFromDb.map((item) => ({
    ...item,
    password: item.username,
  }));
  // }

  const dataResult = await Promise.all(
    userWithPass.map(async (item) => ({
      ...item,
      password: await hash(item.password, 10),
    })),
  );

  // console.log(userWithPass);

  await prisma.$transaction(async (tx) => {
    for (const user of dataResult) {
      await tx.user.update({
        where: { username: user.username },
        data: { password: user.password },
      });
    }
  });
};

const updateProducts = async () => {
  const images = ['product01.jpg', 'product02.jpg', 'product03.jpg', 'product04.jpg', 'product05.jpg', 'product06.jpg', 'product07.jpg', 'product08.jpg', 'product09.jpg']

  const products = await prisma.barang.findMany({ select: { kodeBarang: true } })
  for (const product of products) {
    const random = Math.floor(Math.random() * Math.floor(9));
    const fileName = images[random]
    await prisma.barang.update({ where: { kodeBarang: product.kodeBarang }, data: { fileName } })
  }
}

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
  // await updateUserPassword();
  // await generateEmployee();
  // await generateCustomer();
  // await generateTypes();
  // await generateChartOfAccount();
  // await generateFixedAssetType();
  // await generateParameters();
  // await generateUnits();
  await updateProducts()
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
