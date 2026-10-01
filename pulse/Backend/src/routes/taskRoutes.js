import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
} from '../controllers/taskController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router({ mergeParams: true });
const coordinatorOnly = authorize(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN);

// Standard routes mounted at /api: /api/events/:eventId/tasks
router.route('/events/:eventId/tasks')
  .get(authenticate, getTasks)
  .post(authenticate, coordinatorOnly, createTask);

router.route('/events/:eventId/tasks/:taskId')
  .patch(authenticate, coordinatorOnly, updateTask);

// Support if mounted at /api/events: /api/events/:eventId/tasks
router.route('/:eventId/tasks')
  .get(authenticate, getTasks)
  .post(authenticate, coordinatorOnly, createTask);

router.route('/:eventId/tasks/:taskId')
  .patch(authenticate, coordinatorOnly, updateTask);

// Support if mounted at /api/events/:eventId/tasks
router.route('/')
  .get(authenticate, getTasks)
  .post(authenticate, coordinatorOnly, createTask);

router.route('/:taskId')
  .patch(authenticate, coordinatorOnly, updateTask);

export default router;
