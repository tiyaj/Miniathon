import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/dashboard
router.route('/events/:eventId/dashboard')
  .get(getDashboard);

// Support if mounted at /api/events: /api/events/:eventId/dashboard
router.route('/:eventId/dashboard')
  .get(getDashboard);

// Support if mounted at /api/events/:eventId/dashboard
router.route('/')
  .get(getDashboard);

export default router;
