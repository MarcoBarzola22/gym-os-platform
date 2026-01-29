import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as OTPAuth from 'otpauth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/access/validate
router.post('/validate', async (req, res) => {
  try {
    const { qrContent } = req.body; 
    // qrContent llega como string JSON: '{"id":1, "token":"123456"}'
    
    // 1. Parsear el contenido del QR
    let data;
    try {
      data = JSON.parse(qrContent);
    } catch (e) {
      return res.status(400).json({ error: "Formato de QR inválido" });
    }

    const { id, token } = data;

    // 2. Buscar al usuario en la DB
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 3. Validar Matemáticamente el Token (TOTP)
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.qrSecret || "SECRETODEFAULT" 
      // IMPORTANTE: Debe ser el mismo secreto que se guardó al crear el usuario
    });

    // delta devuelve 0 si es exacto, -1 o 1 si hay pequeña diferencia de hora
    // Si devuelve null, es que el código es incorrecto
    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      return res.status(403).json({ 
        authorized: false, 
        reason: "Código QR inválido o expirado",
        user 
      });
    }

    // 4. Validar Vencimiento (Si debe plata)
    const now = new Date();
    const isExpired = user.expirationDate ? new Date(user.expirationDate) < now : true;

    if (isExpired) {
      return res.status(403).json({ 
        authorized: false, 
        reason: "Cuota Vencida", 
        user 
      });
    }

    // 5. ¡TODO OK! Registramos el acceso
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        status: "GRANTED",
        method: "QR_WEBCAM"
      }
    });

    return res.json({ 
      authorized: true, 
      user 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;