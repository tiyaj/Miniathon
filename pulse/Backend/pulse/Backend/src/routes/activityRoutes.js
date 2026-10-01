import express from 'express';
import { getActivity } from '../controllers/activityController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/activity
router.route('/events/:eventId/activity')
  .get(getActivity);

// Support if mounted at /api/events: /api/events/:eventId/activity
router.route('/:eventId/activity')
  .get(getActivity);

// Support if mounted at /api/events/:eventId/activity
router.route('/')
  .get(getActivity);

export default router;
