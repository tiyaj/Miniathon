import express from 'express';
import {
  getVolunteers,
  createVolunteer,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} from '../controllers/volunteerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });

const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Event nested routes
router.route('/events/:eventId/volunteers')
  .get(authenticate, getVolunteers)
  .post(authenticate, coordinatorOnly, createVolunteer);

router.route('/:eventId/volunteers')
  .get(authenticate, getVolunteers)
  .post(authenticate, coordinatorOnly, createVolunteer);

// Direct volunteer collection routes
router.route('/volunteers')
  .get(authenticate, getVolunteers)
  .post(authenticate, coordinatorOnly, createVolunteer);

router.route('/volunteers/:volunteerId')
  .get(authenticate, getVolunteerById)
  .patch(authenticate, coordinatorOnly, updateVolunteer)
  .delete(authenticate, coordinatorOnly, deleteVolunteer);

export default router;
