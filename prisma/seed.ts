import { ChartOfAccount, PrismaClient } from '@prisma/client';
// import { CoA } from '../rest-api/seed-data/chart-of-account';

// initialize Prisma Client
const prisma = new PrismaClient();

const generateChartOfAccount = async () => {
  const CoA: ChartOfAccount[] = [];
  if (CoA.length === 0) return;
  const accounts: Omit<ChartOfAccount, 'code'>[] = CoA.map(
    (acc) =>
      ({
        ...acc,
        isBalanceSheetAccount:
          parseInt(acc.id.substring(0, 1)) <= 3 ? true : false,
        accountNo: acc.id,
      }) as ChartOfAccount,
  );
  await prisma.chartOfAccount.deleteMany();
  await prisma.chartOfAccount.createMany({
    data: accounts,
    skipDuplicates: true,
  });
  console.log('seeding chart of accounts done!');
};

async function main() {
  if (process.env.NODE_ENV !== 'development') return;
  // await removeAllRecords();
  // await generateUser();
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
