import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// COBRAR (Soporta varios meses)
router.post('/', async (req, res) => {
  try {
    // Recibimos "months" del frontend. Si no llega, asumimos 1.
    const { userId, amount, method, months = 1 } = req.body; 

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 1. LÓGICA DE FECHAS
    const now = new Date();
    let newExpiration = new Date();

    // Si el usuario tiene fecha futura válida, sumamos desde AHÍ.
    // Si es null o ya pasó, sumamos desde HOY.
    if (user.expirationDate && new Date(user.expirationDate) > now) {
      newExpiration = new Date(user.expirationDate);
    } else {
      newExpiration = new Date();
    }

    // 2. MATEMÁTICA PURA (Arreglo del bug de los "2 días")
    const daysToAdd = Number(months) * 30; // <--- ESTO ES LO IMPORTANTE
    newExpiration.setDate(newExpiration.getDate() + daysToAdd);
    
    // 3. SETEAR AL FINAL DEL DÍA
    newExpiration.setHours(23, 59, 59, 999);

    // 4. TRANSACCIÓN
    const result = await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId: Number(userId),
          amount: Number(amount),
          method: method || 'EFECTIVO',
          months: Number(months), // Guardamos cuántos meses pagó
          date: new Date()
        }
      }),
      prisma.user.update({
        where: { id: Number(userId) },
        data: {
          isActive: true,
          expirationDate: newExpiration,
          lastPaymentDate: new Date()
        }
      })
    ]);

    res.json(result[1]);

  } catch (error) {
    console.error("Error procesando pago:", error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

// OBTENER HISTORIAL DE PAGOS DEL USUARIO
router.get('/:userId', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: Number(req.params.userId) },
      orderBy: { date: 'desc' },
      take: 5 // Traemos los últimos 5
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error al traer pagos' });
  }
});

// CANCELAR PAGO (Reversa)
router.delete('/:paymentId', async (req, res) => {
  try {
    const paymentId = Number(req.params.paymentId);

    // 1. Buscamos el pago para saber de quién es y cuántos meses tenía
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });

    // 2. Calculamos los días a RESTAR
    const daysToRemove = payment.months * 30;
    
    // 3. Calculamos la nueva fecha (hacia atrás)
    const currentExpiration = new Date(payment.user.expirationDate || new Date());
    const newExpiration = new Date(currentExpiration);
    newExpiration.setDate(newExpiration.getDate() - daysToRemove);

    // 4. Actualizamos usuario y borramos el pago (Transacción)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payment.userId },
        data: { expirationDate: newExpiration }
      }),
      prisma.payment.delete({
        where: { id: paymentId }
      })
    ]);

    res.json({ success: true, message: 'Pago anulado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al anular pago' });
  }
});

export default router;