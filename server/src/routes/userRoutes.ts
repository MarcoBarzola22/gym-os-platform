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

    // 1. Calculamos vencimiento (30 días desde hoy)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // 2. Generamos el secreto para el QR (Cadena aleatoria simple)
    // Esto crea un texto random tipo "a1b2c3d4e5..."
    const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 3. Creamos el usuario en la DB
    const newUser = await prisma.user.create({
      data: {
        fullName,
        dni,
        email: email || null,
        password: dni,          // <--- La contraseña inicial es el DNI
        qrSecret: randomSecret, // <--- Guardamos la llave para el modo offline
        isActive: true,         // Nace activo
        expirationDate: expirationDate,
        // Generamos una foto automática (Avatar con iniciales)
        photoUrl: `https://ui-avatars.com/api/?name=${fullName.replace(" ", "+")}&background=random`
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creando usuario:", error);
    // Si el error es P2002 (Unique constraint), es que el DNI ya existe
    res.status(400).json({ error: "No se pudo crear. ¿El DNI ya existe?" });
  }


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
});

export default router;