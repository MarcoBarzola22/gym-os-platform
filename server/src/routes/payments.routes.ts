import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Endpoint: POST /api/payments
// Descripción: Registra un pago y renueva la suscripción
router.post('/', async (req, res) => {
  try {
    // 1. Recibimos los datos del frontend (el "sobre" con el dinero virtual)
    // method puede ser: "CASH" (Efectivo), "TRANSFER" (Transferencia), etc.
    const { userId, amount, method } = req.body;

    // Validación básica: Si falta algo, devolvemos error
    if (!userId || !amount || !method) {
      return res.status(400).json({ message: 'Faltan datos (userId, amount, method)' });
    }

    // 2. Buscamos al usuario para ver cuándo vence su cuota ACTUAL
    const user = await prisma.user.findUnique({ 
      where: { id: Number(userId) } 
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 3. LÓGICA DE FECHAS (El cerebro de la operación)
    const now = new Date(); // Fecha de hoy
    let newExpiration = new Date();

    // CASO A: El usuario todavía está al día (ej: vence mañana)
    // -> Le sumamos 30 días a su fecha de vencimiento actual (para no robarle días)
    if (user.expirationDate && user.expirationDate > now) {
      newExpiration = new Date(user.expirationDate);
      newExpiration.setDate(newExpiration.getDate() + 30);
    } 
    // CASO B: El usuario ya venció o es nuevo
    // -> Le damos 30 días a partir de HOY
    else {
      newExpiration = new Date(); // Empezamos hoy
      newExpiration.setDate(newExpiration.getDate() + 30);
    }

    // 4. OPERACIÓN "TODO O NADA" (Transacción implícita)
    // Usamos prisma.user.update para hacer dos cosas al mismo tiempo:
    // A) Actualizar al usuario (nueva fecha)
    // B) Crear el pago en la tabla de pagos (payments)
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        expirationDate: newExpiration, // Nueva fecha calculada
        lastPaymentDate: now,          // Pagó hoy
        isActive: true,                // Por si estaba inactivo, lo reactivamos
        
        // ¡Aquí está el truco! Creamos el pago "anidado"
        payments: {
          create: {
            amount: amount,
            method: method,
            // la fecha se pone sola en "now()" por defecto en el modelo
          }
        }
      }
    });

    // 5. Respondemos con éxito y la nueva fecha
    res.json({
      success: true,
      message: 'Pago registrado exitosamente',
      newExpiration: updatedUser.expirationDate,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;