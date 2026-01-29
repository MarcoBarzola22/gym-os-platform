import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/payments
// Renovar suscripción
router.post('/', async (req, res) => {
  try {
    const { userId, amount, method } = req.body; // method puede ser 'EFECTIVO', 'TRANSFERENCIA', etc.

    // 1. Buscar al usuario
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2. Calcular nueva fecha
    // Si ya estaba vencido, cuenta 30 días desde HOY.
    // Si todavía no vencía, le suma 30 días a lo que le quedaba.
    const now = new Date();
    let newExpirationDate = user.expirationDate && user.expirationDate > now 
      ? new Date(user.expirationDate) 
      : new Date();
    
    newExpirationDate.setDate(newExpirationDate.getDate() + 30);

    // 3. Guardar el pago y actualizar usuario en una "Transacción" (todo o nada)
    const result = await prisma.$transaction([
      // A. Crear registro de pago
      prisma.payment.create({
        data: {
          userId: Number(userId),
          amount: Number(amount),
          method: method || 'EFECTIVO',
          date: new Date()
        }
      }),
      // B. Actualizar usuario
      prisma.user.update({
        where: { id: Number(userId) },
        data: {
          isActive: true,
          expirationDate: newExpirationDate,
          lastPaymentDate: new Date()
        }
      })
    ]);

    // Devolvemos el usuario actualizado (el segundo elemento del array transaction)
    res.json(result[1]);

  } catch (error) {
    console.error("Error procesando pago:", error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

export default router;