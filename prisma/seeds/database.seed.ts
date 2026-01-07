import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const gym = await prisma.gym.upsert({
    where: { name: 'Default Gym' },
    update: {},
    create: {
      name: 'Default Gym',
      address: '123 Main St',
    },
  });

  //SuperAdmin
  const hashedSuperAdmin = await bcrypt.hash('superadmin888', 10);
  await prisma.user.upsert({
    where: { email: 'maianhtu2001@gmail.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'maianhtu2001@gmail.com',
      dateOfBirth: new Date('2001-06-11'),
      phone: '0964512001',
      password: hashedSuperAdmin,
      role: UserRole.SUPER_ADMIN,
      gymId: null,
    },
  });

  // Admin
  const hashedAdmin = await bcrypt.hash('admin888', 10);
  await prisma.user.upsert({
    where: {
      email: 'admin123@gym.com',
    },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin123@gym.com',
      dateOfBirth: new Date('2001-08-25'),
      phone: '0912345678',
      password: hashedAdmin,
      role: UserRole.ADMIN,
      gymId: 1,
    },
  });

  // //PT
  const hashedPT = await bcrypt.hash('pt888', 10);
  await prisma.user.upsert({
    where: {
      email: 'pt@gym.com',
    },
    update: {},
    create: {
      email: 'pt@gym.com',
      dateOfBirth: new Date('1998-08-20'),
      phone: '0964532001',
      name: 'PT Gym1',
      password: hashedPT,
      role: UserRole.PT,
      gymId: 1,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'maitu2923124@gmail.com' },
    update: {},
    create: {
      name: 'Tuspro',
      phone: '0964423001',
      dateOfBirth: new Date('2001-06-10'),
      password: '999999999',
      email: 'maitu2923124@gmail.com',
      gymId: 1,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
