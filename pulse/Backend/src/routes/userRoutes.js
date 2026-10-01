import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All user management routes require authentication and ADMIN or SUPER_ADMIN role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.patch('/:userId/status', updateUserStatus);
router.patch('/:userId/role', updateUserRole);

export default router;
