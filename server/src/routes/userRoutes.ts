import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. OBTENER TODOS (Para el Dashboard)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// 2. CREAR USUARIO (Registro Rápido)
router.post('/', async (req, res) => {
  try {
    const { fullName, dni, email } = req.body;

    // Calculamos fecha de vencimiento (Hoy + 30 días)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        dni,
        email: email || null,
        password: dni, // <--- LA CLAVE ES EL DNI
        isActive: true,
        expirationDate: expirationDate,
        photoUrl: `https://ui-avatars.com/api/?name=${fullName}&background=random`,
        qrSecret: Math.random().toString(36).substring(7) // Temporal, luego usaremos librería real
      }
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    // Si el error es por DNI duplicado (código P2002 de Prisma)
    res.status(400).json({ error: "El DNI ya está registrado" });
  }
});

export default router;