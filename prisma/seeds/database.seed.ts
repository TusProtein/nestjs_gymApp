import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
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
    },
  });

  // //PT
  // const hashedPT = await bcrypt.hash('pt888', 10);
  // await prisma.user.upsert({
  //   where: {
  //     email: 'pt@gym.com',
  //   },
  //   update: {},
  //   create: {
  //     email: 'pt@gym.com',
  //     dateOfBirth: '',
  //     phone: '0964532001',
  //     name: 'LL',
  //     password: hashedPT,
  //     role: UserRole.PT,
  //   },
  // });

  // const user = await prisma.user.create({
  //   data: {
  //     name: 'Tuspro',
  //     phone: '0964423001',
  //     dateOfBirth: '',

  //     password: '999999999',
  //     email: 'maitu2923124@gmail.com',
  //   },
  // });
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
