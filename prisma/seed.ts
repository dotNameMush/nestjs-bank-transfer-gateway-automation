import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing orders
  await prisma.order.deleteMany();

  const statuses = Object.values(OrderStatus);
  const orders = Array.from({ length: 10 }, (_, i) => ({
    subtotal: parseFloat((Math.random() * 1000).toFixed(2)),
    total: parseFloat((Math.random() * 1200).toFixed(2)),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    ),
  }));

  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
