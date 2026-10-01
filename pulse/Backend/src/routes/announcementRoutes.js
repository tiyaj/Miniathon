import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
} from '../controllers/announcementController.js';
import { getActivity } from '../controllers/activityController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Standard routes mounted at /api: /api/events/:eventId/announcements
router.route('/events/:eventId/announcements')
  .get(authenticate, getAnnouncements)
  .post(authenticate, coordinatorOnly, createAnnouncement);

// Support if mounted at /api/events: /api/events/:eventId/announcements
router.route('/:eventId/announcements')
  .get(authenticate, getAnnouncements)
  .post(authenticate, coordinatorOnly, createAnnouncement);

// Support if mounted at /api/events/:eventId/announcements
router.route('/')
  .get(authenticate, getAnnouncements)
  .post(authenticate, coordinatorOnly, createAnnouncement);

// Also expose /events/:eventId/activity on this router for convenience (Coordinator+)
router.route('/events/:eventId/activity')
  .get(authenticate, coordinatorOnly, getActivity);

router.route('/:eventId/activity')
  .get(authenticate, coordinatorOnly, getActivity);

export default router;
