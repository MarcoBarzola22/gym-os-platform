import { Router } from 'express';
import { prisma } from '../prisma'; // Asegurate que esta ruta sea correcta según tu estructura
import bcrypt from 'bcryptjs';

const router = Router();

// Endpoint: GET /
// Descripción: Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { fullName: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint: POST /
// Descripción: Crear un nuevo usuario (Registro Rápido)
router.post('/', async (req, res) => {
  try {
    const { fullName, dni, email } = req.body;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        dni,
        email,
        password: dni, // Contraseña inicial = DNI
        role: "MEMBER",
        isActive: true, // La cuenta existe...
        expirationDate: null // ...pero NO tiene pagos (está vencido)
      }
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});


  router.post('/', async (req, res) => {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // <--- Hashing
    
    const newUser = await prisma.user.create({
      data: { 
        ...rest, 
        password: hashedPassword 
      }
    });
    // ...
  });


export default router;