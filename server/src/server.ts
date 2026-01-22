import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes'; // <--- 1. Importamos las rutas
import scanRoutes from './routes/scan.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- RUTAS ---
// Aquí decimos: "Todo lo que empiece con /api/users, manéjalo con userRoutes"
app.use('/api/users', userRoutes); // <--- 2. Usamos las rutas
app.use('/api/scan-events', scanRoutes);

// Rutas de prueba (la que ya tenías)
app.get('/', (req, res) => {
  res.json({ message: 'GymOS API is running 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});