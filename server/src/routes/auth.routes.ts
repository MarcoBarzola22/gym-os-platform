import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    // 1. Buscamos al usuario
    const user = await prisma.user.findUnique({
      where: { dni }
    });

    // 2. Verificamos si existe y si la contraseña coincide
    // (En un sistema real usaríamos bcrypt, pero para este MVP comparamos texto plano)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    // 3. SI TODO ESTÁ BIEN: Devolvemos sus datos y LA LLAVE SECRETA
    res.json({
      id: user.id,
      name: user.fullName,
      dni: user.dni,
      photoUrl: user.photoUrl,
      qrSecret: user.qrSecret, // <--- IMPORTANTE: El frontend guardará esto
      status: user.isActive ? 'active' : 'expired',
      expirationDate: user.expirationDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;