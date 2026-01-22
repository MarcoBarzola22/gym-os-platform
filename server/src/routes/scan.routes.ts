import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// 1. EL CELULAR HABLA (Guardar el escaneo)
// Endpoint: POST /api/scan-events
router.post('/', async (req, res) => {
  try {
    const { qrContent } = req.body; // El celular nos manda esto (ej: el DNI del usuario)

    if (!qrContent) {
      return res.status(400).json({ message: 'Falta el contenido del QR' });
    }

    // Guardamos el evento en la "bandeja de entrada" (tabla ScanEvent)
    const newScan = await prisma.scanEvent.create({
      data: {
        qrContent: qrContent,
        processed: false, // Importante: Aún nadie lo vio en recepción
      },
    });

    res.json({ message: 'Escaneo recibido', id: newScan.id });
  } catch (error) {
    console.error('Error guardando escaneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// 2. LA PC ESCUCHA (Polling)
// Endpoint: GET /api/scan-events/poll
// La PC preguntará esto cada 2 segundos: "¿Hay algo nuevo?"
router.get('/poll', async (req, res) => {
  try {
    // A. Buscamos el escaneo más viejo que NO haya sido procesado
    const pendingScan = await prisma.scanEvent.findFirst({
      where: { processed: false },
      orderBy: { scannedAt: 'asc' }, // El que llegó primero, sale primero (fila india)
    });

    // Si no hay nada nuevo, le decimos "falso alarma"
    if (!pendingScan) {
      return res.json({ found: false });
    }

    // B. Si encontramos un escaneo, lo marcamos como "procesado" para no leerlo dos veces
    await prisma.scanEvent.update({
      where: { id: pendingScan.id },
      data: { processed: true },
    });

    // C. ¡Magia! Buscamos al usuario que tiene ese DNI (o código)
    // Asumimos que el QR tiene el DNI del usuario
    const user = await prisma.user.findUnique({
      where: { dni: pendingScan.qrContent },
    });

    if (!user) {
        // Leímos un QR, pero no coincide con ningún socio
        return res.json({ found: true, success: false, message: 'Usuario no encontrado' });
    }

    // D. Devolvemos el usuario a la PC para que abra el modal
    res.json({ 
        found: true, 
        success: true, 
        user: user 
    });

  } catch (error) {
    console.error('Error en poll:', error);
    res.status(500).json({ message: 'Error interno' });
  }
});

export default router;