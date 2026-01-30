import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient(); // Puedes usar 'import { prisma } from '../prisma';' si prefieres centralizarlo

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { dni }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
    }

    // 3. RESPUESTA AL FRONTEND
    res.json({
      id: user.id,
      name: user.fullName,
      dni: user.dni,
      photoUrl: user.photoUrl,
      qrSecret: user.qrSecret,
      
      // 👇👇👇 AGREGA ESTA LÍNEA 👇👇👇
      role: user.role, 
      // 👆👆👆 ESTO ES LO NUEVO 👆👆👆

      status: user.isActive ? 'active' : 'expired',
      expirationDate: user.expirationDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;