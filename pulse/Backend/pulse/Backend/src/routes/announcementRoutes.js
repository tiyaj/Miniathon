import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
} from '../controllers/announcementController.js';
import { getActivity } from '../controllers/activityController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/announcements
router.route('/events/:eventId/announcements')
  .get(getAnnouncements)
  .post(createAnnouncement);

// Support if mounted at /api/events: /api/events/:eventId/announcements
router.route('/:eventId/announcements')
  .get(getAnnouncements)
  .post(createAnnouncement);

// Support if mounted at /api/events/:eventId/announcements
router.route('/')
  .get(getAnnouncements)
  .post(createAnnouncement);

// Also expose /events/:eventId/activity on this router for convenience
router.route('/events/:eventId/activity')
  .get(getActivity);

router.route('/:eventId/activity')
  .get(getActivity);

export default router;
