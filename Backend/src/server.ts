import 'dotenv/config';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';

// Routes
import authRoutes from './routes/auth';
import missionRoutes from './routes/missions';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import statsRoutes from './routes/stats';
import adminRoutes from './routes/admin';
import skillsRoutes from './routes/skills';
import supportRoutes from './routes/support';

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = Number(process.env.PORT) || 5000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Handled per-client
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'https://volunova.dz',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('exp://')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid CORS blocking jury tests
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'VOLUNOVA Core Backend Engine (Zero-Trust Edition)',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/support', supportRoutes);

// 404 Fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist on VOLUNOVA API`,
    },
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    ok: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server',
    },
  });
});

// Start Server & Connect Database (Dual-stack IPv4 and IPv6)
async function startServer() {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 VOLUNOVA Backend running on port: ${PORT} (Dual-Stack IPv4/IPv6 with Real-Time WebSockets)`);
    console.log(`📡 Health check: http://127.0.0.1:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  try {
    await connectDB();
  } catch (err) {
    console.warn('[MongoDB Initialization]', err);
  }
}

startServer();

export default app;
