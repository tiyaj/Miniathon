import express from 'express';
import {
  getEvents,
  getEventById,
  getEventStructure,
  createEvent,
} from '../controllers/eventController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted under /api/events
router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:eventId')
  .get(getEventById);

router.route('/:eventId/structure')
  .get(getEventStructure);

export default router;
