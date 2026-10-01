import express from 'express';
import {
  getAssignments,
  createAssignment,
  removeAssignment,
  checkIn,
  checkOut,
  markDropout,
  getSuggestions,
  getCoverage,
} from '../controllers/assignmentController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/assignments
router.route('/events/:eventId/assignments')
  .get(getAssignments)
  .post(createAssignment);

router.route('/events/:eventId/assignments/:assignmentId')
  .delete(removeAssignment);

router.route('/events/:eventId/assignments/:assignmentId/check-in')
  .post(checkIn);

router.route('/events/:eventId/assignments/:assignmentId/check-out')
  .post(checkOut);

router.route('/events/:eventId/assignments/:assignmentId/dropout')
  .post(markDropout);

router.route('/events/:eventId/roles/:roleId/suggestions')
  .get(getSuggestions);

router.route('/events/:eventId/coverage')
  .get(getCoverage);

// Support if mounted at /api/events
router.route('/:eventId/assignments')
  .get(getAssignments)
  .post(createAssignment);

router.route('/:eventId/assignments/:assignmentId')
  .delete(removeAssignment);

router.route('/:eventId/assignments/:assignmentId/check-in')
  .post(checkIn);

router.route('/:eventId/assignments/:assignmentId/check-out')
  .post(checkOut);

router.route('/:eventId/assignments/:assignmentId/dropout')
  .post(markDropout);

router.route('/:eventId/roles/:roleId/suggestions')
  .get(getSuggestions);

router.route('/:eventId/coverage')
  .get(getCoverage);

export default router;
