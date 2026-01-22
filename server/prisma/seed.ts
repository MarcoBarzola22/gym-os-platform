import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de datos...');

  // Borrar datos viejos para no repetir
  await prisma.scanEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios de prueba
  await prisma.user.createMany({
    data: [
      {
        fullName: 'Marco Barzola',
        dni: '12345678',
        status: 'ACTIVE', // O el campo booleano isActive: true
        expirationDate: new Date(new Date().setDate(new Date().getDate() + 15)), // Vence en 15 días
        photoUrl: 'https://i.pravatar.cc/150?u=marco',
        qrSecret: 'JBSWY3DPEHPK3PXP', // Secreto para generar QRs
      },
      {
        fullName: 'Juan Pérez',
        dni: '87654321',
        status: 'INACTIVE', // isActive: false
        expirationDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Venció hace 5 días
        photoUrl: 'https://i.pravatar.cc/150?u=juan',
        qrSecret: 'KRSXG5CTMVRXEZLU',
      },
      {
        fullName: 'Maria Gym',
        dni: '11223344',
        status: 'ACTIVE',
        expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        photoUrl: 'https://i.pravatar.cc/150?u=maria',
        qrSecret: 'NB2HI4DTHIXS633P',
      },
    ],
  });

  console.log('✅ Base de datos poblada con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });