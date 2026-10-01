import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware configuration
const corsOrigin = process.env.CLIENT_URL || true;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      message: 'PULSE API is running',
    },
  });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api', eventRoutes);
app.use('/api', volunteerRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', taskRoutes);
app.use('/api', incidentRoutes);
app.use('/api', announcementRoutes);
app.use('/api', activityRoutes);
app.use('/api', dashboardRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;

