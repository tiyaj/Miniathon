import express from 'express';
import {
  getAssignments,
  createAssignment,
  getAssignmentById,
  removeAssignment,
  checkIn,
  checkOut,
  markDropout,
  getSuggestions,
  replaceAssignment,
  getCoverage,
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Event nested assignments: support both /events/:eventId/... and /:eventId/...

// 1. Assignments list & create
router.route('/events/:eventId/assignments')
  .get(authenticate, getAssignments)
  .post(authenticate, coordinatorOnly, createAssignment);

router.route('/:eventId/assignments')
  .get(authenticate, getAssignments)
  .post(authenticate, coordinatorOnly, createAssignment);

// 2. Single assignment
router.route('/events/:eventId/assignments/:assignmentId')
  .get(authenticate, getAssignmentById)
  .delete(authenticate, coordinatorOnly, removeAssignment);

router.route('/:eventId/assignments/:assignmentId')
  .get(authenticate, getAssignmentById)
  .delete(authenticate, coordinatorOnly, removeAssignment);

// 3. Check-in
router.route('/events/:eventId/assignments/:assignmentId/check-in')
  .post(authenticate, checkIn);

router.route('/:eventId/assignments/:assignmentId/check-in')
  .post(authenticate, checkIn);

// 4. Check-out
router.route('/events/:eventId/assignments/:assignmentId/check-out')
  .post(authenticate, checkOut);

router.route('/:eventId/assignments/:assignmentId/check-out')
  .post(authenticate, checkOut);

// 5. Dropout
router.route('/events/:eventId/assignments/:assignmentId/dropout')
  .post(authenticate, markDropout);

router.route('/:eventId/assignments/:assignmentId/dropout')
  .post(authenticate, markDropout);

// 6. Replace
router.route('/events/:eventId/assignments/:assignmentId/replace')
  .post(authenticate, coordinatorOnly, replaceAssignment);

router.route('/:eventId/assignments/:assignmentId/replace')
  .post(authenticate, coordinatorOnly, replaceAssignment);

// 7. Suggestions for dropped slot
router.route('/events/:eventId/assignments/:assignmentId/suggestions')
  .get(authenticate, coordinatorOnly, getSuggestions);

router.route('/:eventId/assignments/:assignmentId/suggestions')
  .get(authenticate, coordinatorOnly, getSuggestions);

// 8. Suggestions for role
router.route('/events/:eventId/roles/:roleId/suggestions')
  .get(authenticate, coordinatorOnly, getSuggestions);

router.route('/:eventId/roles/:roleId/suggestions')
  .get(authenticate, coordinatorOnly, getSuggestions);

// 9. Coverage
router.route('/events/:eventId/coverage')
  .get(authenticate, getCoverage);

router.route('/:eventId/coverage')
  .get(authenticate, getCoverage);

// Direct assignment routes
router.route('/assignments')
  .get(authenticate, getAssignments)
  .post(authenticate, coordinatorOnly, createAssignment);

router.route('/assignments/:assignmentId')
  .get(authenticate, getAssignmentById)
  .delete(authenticate, coordinatorOnly, removeAssignment);

router.route('/assignments/:assignmentId/check-in')
  .post(authenticate, checkIn);

router.route('/assignments/:assignmentId/check-out')
  .post(authenticate, checkOut);

router.route('/assignments/:assignmentId/dropout')
  .post(authenticate, markDropout);

router.route('/assignments/:assignmentId/replace')
  .post(authenticate, coordinatorOnly, replaceAssignment);

router.route('/assignments/:assignmentId/suggestions')
  .get(authenticate, coordinatorOnly, getSuggestions);

export default router;
