import express from 'express';
import {
  getIncidents,
  createIncident,
  acknowledgeIncident,
  escalateIncident,
  resolveIncident,
} from '../controllers/incidentController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/incidents
router.route('/events/:eventId/incidents')
  .get(getIncidents)
  .post(createIncident);

router.route('/events/:eventId/incidents/:incidentId/acknowledge')
  .patch(acknowledgeIncident);

router.route('/events/:eventId/incidents/:incidentId/escalate')
  .patch(escalateIncident);

router.route('/events/:eventId/incidents/:incidentId/resolve')
  .patch(resolveIncident);

// Support if mounted at /api/events: /api/events/:eventId/incidents
router.route('/:eventId/incidents')
  .get(getIncidents)
  .post(createIncident);

router.route('/:eventId/incidents/:incidentId/acknowledge')
  .patch(acknowledgeIncident);

router.route('/:eventId/incidents/:incidentId/escalate')
  .patch(escalateIncident);

router.route('/:eventId/incidents/:incidentId/resolve')
  .patch(resolveIncident);

// Support if mounted at /api/events/:eventId/incidents
router.route('/')
  .get(getIncidents)
  .post(createIncident);

router.route('/:incidentId/acknowledge')
  .patch(acknowledgeIncident);

router.route('/:incidentId/escalate')
  .patch(escalateIncident);

router.route('/:incidentId/resolve')
  .patch(resolveIncident);

export default router;
