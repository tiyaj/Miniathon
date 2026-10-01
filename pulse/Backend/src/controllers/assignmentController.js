import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import Role from '../models/Role.js';
import Shift from '../models/Shift.js';
import Event from '../models/Event.js';
import { logActivity } from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  checkInAssignment,
  checkOutAssignment,
  dropoutAssignment,
  populateAssignment,
} from '../services/attendanceService.js';
import { checkHardConstraints, findCandidateRecommendations } from '../services/matchingService.js';
import { getVacancySuggestions, replaceDroppedAssignment } from '../services/reassignmentService.js';
import { calculateEventCoverage } from '../services/coverageService.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

const findAssignmentById = async (assignmentId) => {
  if (!assignmentId) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(assignmentId);
  return await Assignment.findOne({
    $or: [
      { _id: assignmentId },
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(assignmentId) }] : []),
    ],
  });
};

/**
 * GET /api/events/:eventId/assignments & GET /api/assignments
 */
export const getAssignments = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.query.event || req.query.eventId;
    const filter = {};

    if (eventId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
      filter.$or = [
        { event: eventId },
        { eventId },
        ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.roleId || req.query.role) {
      const rId = req.query.roleId || req.query.role;
      filter.$or = [{ role: rId }, { roleId: rId }];
    }
    if (req.query.shiftId || req.query.shift) {
      const sId = req.query.shiftId || req.query.shift;
      filter.$or = [{ shift: sId }, { shiftId: sId }];
    }
    if (req.query.volunteerId || req.query.volunteer) {
      const vId = req.query.volunteerId || req.query.volunteer;
      filter.$or = [{ volunteer: vId }, { volunteerId: vId }];
    }

    const assignments = await populateAssignment(Assignment.find(filter).sort({ createdAt: -1 }));
    return sendSuccess(res, assignments, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET single assignment
 */
export const getAssignmentById = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await populateAssignment(Assignment.findById(assignmentId));
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }
    return sendSuccess(res, assignment, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/assignments & POST /api/assignments
 */
export const createAssignment = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.body?.eventId || req.body?.event;
    const volunteerId = req.body?.volunteerId || req.body?.volunteer;
    const roleId = req.body?.roleId || req.body?.role;
    const shiftId = req.body?.shiftId || req.body?.shift;

    if (!volunteerId) {
      return sendError(res, 'Volunteer ID is required', 'VALIDATION_ERROR', 400);
    }
    if (!roleId) {
      return sendError(res, 'Role ID is required', 'VALIDATION_ERROR', 400);
    }

    // 1. Fetch referenced entities
    const isVolObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
    const volunteer = await Volunteer.findOne({
      $or: [
        { _id: volunteerId },
        ...(isVolObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
      ],
    });

    if (!volunteer) {
      return sendError(res, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND', 404);
    }

    const isRoleObjectId = mongoose.Types.ObjectId.isValid(roleId);
    const role = await Role.findOne({
      $or: [
        { _id: roleId },
        ...(isRoleObjectId ? [{ _id: new mongoose.Types.ObjectId(roleId) }] : []),
      ],
    });

    if (!role) {
      return sendError(res, 'Role not found', 'ROLE_NOT_FOUND', 404);
    }

    let shift = null;
    if (shiftId) {
      const isShiftObjectId = mongoose.Types.ObjectId.isValid(shiftId);
      shift = await Shift.findOne({
        $or: [
          { _id: shiftId },
          ...(isShiftObjectId ? [{ _id: new mongoose.Types.ObjectId(shiftId) }] : []),
        ],
      });
      if (!shift) {
        return sendError(res, 'Shift not found', 'SHIFT_NOT_FOUND', 404);
      }
    }

    // 2. Validate Event Mismatch if event is provided
    if (eventId) {
      const eventIdStr = eventId.toString().trim();
      const roleEventStr = (role.event?._id || role.event || role.eventId)?.toString();
      if (roleEventStr && roleEventStr !== eventIdStr) {
        return sendError(res, 'Role does not belong to the specified event', 'EVENT_MISMATCH', 400);
      }
      if (shift) {
        const shiftEventStr = (shift.event?._id || shift.event || shift.eventId)?.toString();
        if (shiftEventStr && shiftEventStr !== eventIdStr) {
          return sendError(res, 'Shift does not belong to the specified event', 'EVENT_MISMATCH', 400);
        }
      }
    }

    // 3. Role capacity check
    const roleIdStr = (role.id || role._id).toString();
    const shiftIdStr = shift ? (shift.id || shift._id).toString() : null;

    const capacityQuery = {
      $and: [
        {
          $or: [
            { role: role._id },
            { roleId: roleIdStr },
          ],
        },
        ...(shift ? [{
          $or: [
            { shift: shift._id },
            { shiftId: shiftIdStr },
          ],
        }] : []),
        {
          status: { $nin: INACTIVE_STATUSES },
        },
      ],
    };

    const activeRoleAssignments = await Assignment.countDocuments(capacityQuery);

    const maxCapacity = Number(role.requiredCount || role.capacity) || 1;
    if (activeRoleAssignments >= maxCapacity) {
      return sendError(res, 'Role capacity is full for this shift', 'ROLE_FULL', 409);
    }

    // 4. Hard constraints & Overlap check
    const constraintCheck = await checkHardConstraints(volunteer, shift, role, eventId);
    if (!constraintCheck.eligible) {
      if (constraintCheck.isOverlap || constraintCheck.reason.includes('overlapping')) {
        return sendError(res, constraintCheck.reason, 'VOLUNTEER_DOUBLE_BOOKED', 409);
      }
      return sendError(res, `Volunteer is ineligible: ${constraintCheck.reason}`, 'INELIGIBLE_VOLUNTEER', 400);
    }

    const isEventObjectId = eventId && mongoose.Types.ObjectId.isValid(eventId);
    const assignment = await Assignment.create({
      event: isEventObjectId ? new mongoose.Types.ObjectId(eventId) : (eventId || role.event),
      eventId: eventId ? eventId.toString() : (role.eventId || (role.event?._id || role.event)?.toString()),
      volunteer: volunteer._id,
      volunteerId: (volunteer.id || volunteer._id).toString(),
      role: role._id,
      roleId: (role.id || role._id).toString(),
      shift: shift ? shift._id : null,
      shiftId: shift ? (shift.id || shift._id).toString() : null,
      status: 'assigned',
    });

    // Update volunteer status
    volunteer.status = 'assigned';
    await volunteer.save();

    const evtId = eventId || assignment.eventId;
    if (evtId) {
      await logActivity(
        evtId,
        'assignment_created',
        `Volunteer ${volunteer.name} assigned to role ${role.name}`,
        {
          assignmentId: assignment.id || assignment._id.toString(),
          volunteerId: volunteer.id || volunteer._id.toString(),
          roleId: role.id || role._id.toString(),
          shiftId: shift ? (shift.id || shift._id).toString() : null,
        }
      );
    }

    const populated = await populateAssignment(Assignment.findById(assignment._id));
    return sendSuccess(res, populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:eventId/assignments/:assignmentId
 */
export const removeAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }

    if (assignment.status === 'completed') {
      return sendError(res, 'Cannot cancel an assignment that has already been completed', 'INVALID_ATTENDANCE_STATE', 400);
    }
    if (assignment.status === 'dropped') {
      return sendError(res, 'Cannot cancel an assignment that has already been marked as dropped', 'INVALID_ATTENDANCE_STATE', 400);
    }
    if (assignment.status === 'cancelled') {
      return sendError(res, 'Assignment is already cancelled', 'INVALID_ATTENDANCE_STATE', 400);
    }

    assignment.status = 'cancelled';
    await assignment.save();

    const populated = await populateAssignment(Assignment.findById(assignment._id));
    return sendSuccess(res, { message: 'Assignment removed successfully', assignment: populated }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Check-in
 */
export const checkIn = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const assignmentId = req.params.assignmentId;
    const assignment = await checkInAssignment(eventId, assignmentId);
    return sendSuccess(res, assignment, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * Check-out
 */
export const checkOut = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const assignmentId = req.params.assignmentId;
    const assignment = await checkOutAssignment(eventId, assignmentId);
    return sendSuccess(res, assignment, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * Dropout
 */
export const markDropout = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const assignmentId = req.params.assignmentId;
    const assignment = await dropoutAssignment(eventId, assignmentId);
    return sendSuccess(res, assignment, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * Suggestions for Role vacancy or Dropped Assignment
 */
export const getSuggestions = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const targetId = req.params.roleId || req.params.assignmentId;

    const result = await getVacancySuggestions(eventId, targetId);
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * Replace Dropped Assignment
 */
export const replaceAssignment = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const assignmentId = req.params.assignmentId;
    const volunteerId = req.body?.volunteerId;

    if (!volunteerId) {
      return sendError(res, 'Valid volunteerId is required', 'VALIDATION_ERROR', 400);
    }

    const result = await replaceDroppedAssignment(eventId, assignmentId, volunteerId);
    return sendSuccess(res, result, 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * Coverage
 */
export const getCoverage = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const coverage = await calculateEventCoverage(eventId, req.query?.shiftId);
    return sendSuccess(res, coverage, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};
