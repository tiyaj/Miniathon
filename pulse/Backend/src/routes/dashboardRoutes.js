import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Standard routes mounted at /api: /api/events/:eventId/dashboard
router.route('/events/:eventId/dashboard')
  .get(authenticate, coordinatorOnly, getDashboard);

// Support if mounted at /api/events: /api/events/:eventId/dashboard
router.route('/:eventId/dashboard')
  .get(authenticate, coordinatorOnly, getDashboard);

// Support if mounted at /api/events/:eventId/dashboard
router.route('/')
  .get(authenticate, coordinatorOnly, getDashboard);

export default router;
