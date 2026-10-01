import express from 'express';
import {
  getEvents,
  getEventById,
  getEventStructure,
  getEventCoverage,
  getEventResilience,
  simulateDisruption,
  createEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });

// Event listing (read-only for all authenticated users) & event creation (Coordinator+)
router.route('/')
  .get(authenticate, getEvents)
  .post(authenticate, authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN), createEvent);

router.route('/:eventId')
  .get(authenticate, getEventById);

router.route('/:eventId/structure')
  .get(authenticate, getEventStructure);

router.route('/:eventId/coverage')
  .get(authenticate, getEventCoverage);

// Feature 1: Resilience Engine (Protected - Coordinator+)
router.route('/:eventId/resilience')
  .get(authenticate, authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN), getEventResilience);

// Feature 2: What-If Simulator (Protected - Coordinator+)
router.route('/:eventId/simulate')
  .post(authenticate, authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN), simulateDisruption);

export default router;
