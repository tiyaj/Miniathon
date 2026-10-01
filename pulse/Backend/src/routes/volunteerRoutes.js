import express from 'express';
import {
  getVolunteers,
  createVolunteer,
} from '../controllers/volunteerController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api/events/:eventId/volunteers
router.route('/events/:eventId/volunteers')
  .get(getVolunteers)
  .post(createVolunteer);

// Support if mounted at /api/events
router.route('/:eventId/volunteers')
  .get(getVolunteers)
  .post(createVolunteer);

// Support if mounted at /api/events/:eventId/volunteers
router.route('/')
  .get(getVolunteers)
  .post(createVolunteer);

export default router;
