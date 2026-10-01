import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

// Standard routes mounted at /api: /api/events/:eventId/tasks
router.route('/events/:eventId/tasks')
  .get(getTasks)
  .post(createTask);

router.route('/events/:eventId/tasks/:taskId')
  .patch(updateTask);

// Support if mounted at /api/events: /api/events/:eventId/tasks
router.route('/:eventId/tasks')
  .get(getTasks)
  .post(createTask);

router.route('/:eventId/tasks/:taskId')
  .patch(updateTask);

// Support if mounted at /api/events/:eventId/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:taskId')
  .patch(updateTask);

export default router;
