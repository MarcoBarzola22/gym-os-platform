import { Router } from 'express';
import { prisma } from '../prisma'; // Importamos la conexión que creamos en el paso 1

const router = Router();

// Endpoint: GET /
// Descripción: Obtener todos los usuarios (socios)
router.get('/', async (req, res) => {
  try {
    // 1. Usamos prisma para buscar "muchos" (findMany) registros en la tabla User
    // Esto es equivalente a hacer un "SELECT * FROM User" en SQL
    const users = await prisma.user.findMany({
      orderBy: {
        fullName: 'asc', // Opcional: Los ordenamos alfabéticamente
      },
    });

    // 2. Respondemos al frontend con un JSON que contiene la lista
    res.json(users);
  } catch (error) {
    // 3. Si algo falla (ej. base de datos caída), mostramos error en consola y respondemos 500
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;