import express from 'express';
import { getActivity } from '../controllers/activityController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Standard routes mounted at /api: /api/events/:eventId/activity
router.route('/events/:eventId/activity')
  .get(authenticate, coordinatorOnly, getActivity);

// Support if mounted at /api/events: /api/events/:eventId/activity
router.route('/:eventId/activity')
  .get(authenticate, coordinatorOnly, getActivity);

// Support if mounted at /api/events/:eventId/activity
router.route('/')
  .get(authenticate, coordinatorOnly, getActivity);

export default router;
