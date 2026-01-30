import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
    // 2. COMPARACIÓN SEGURA
    // Si la contraseña en la BD ya está encriptada (empieza con $2b$...), usamos compare
    // Si es vieja (texto plano), comparamos directo (esto permite migrar gradualmente)
    const isMatch = user.password.startsWith('$2b$') 
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

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