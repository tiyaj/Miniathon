import express from 'express';
import {
  getIncidents,
  createIncident,
  acknowledgeIncident,
  escalateIncident,
  resolveIncident,
} from '../controllers/incidentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Standard routes mounted at /api: /api/events/:eventId/incidents
router.route('/events/:eventId/incidents')
  .get(authenticate, getIncidents)
  .post(authenticate, createIncident);

router.route('/events/:eventId/incidents/:incidentId/acknowledge')
  .patch(authenticate, coordinatorOnly, acknowledgeIncident);

router.route('/events/:eventId/incidents/:incidentId/escalate')
  .patch(authenticate, coordinatorOnly, escalateIncident);

router.route('/events/:eventId/incidents/:incidentId/resolve')
  .patch(authenticate, coordinatorOnly, resolveIncident);

// Support if mounted at /api/events: /api/events/:eventId/incidents
router.route('/:eventId/incidents')
  .get(authenticate, getIncidents)
  .post(authenticate, createIncident);

router.route('/:eventId/incidents/:incidentId/acknowledge')
  .patch(authenticate, coordinatorOnly, acknowledgeIncident);

router.route('/:eventId/incidents/:incidentId/escalate')
  .patch(authenticate, coordinatorOnly, escalateIncident);

router.route('/:eventId/incidents/:incidentId/resolve')
  .patch(authenticate, coordinatorOnly, resolveIncident);

// Support if mounted at /api/events/:eventId/incidents
router.route('/')
  .get(authenticate, getIncidents)
  .post(authenticate, createIncident);

router.route('/:incidentId/acknowledge')
  .patch(authenticate, coordinatorOnly, acknowledgeIncident);

router.route('/:incidentId/escalate')
  .patch(authenticate, coordinatorOnly, escalateIncident);

router.route('/:incidentId/resolve')
  .patch(authenticate, coordinatorOnly, resolveIncident);

export default router;
