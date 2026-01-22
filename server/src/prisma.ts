import { PrismaClient } from '@prisma/client';

// Creamos una única instancia del cliente de Prisma
export const prisma = new PrismaClient();