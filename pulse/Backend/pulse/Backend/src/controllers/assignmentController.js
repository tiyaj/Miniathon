import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import Role from '../models/Role.js';
import Shift from '../models/Shift.js';
import Zone from '../models/Zone.js';
import { logActivity } from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Safely find assignment by ID supporting both ObjectId and string ID formats.
 */
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
 * GET /api/events/:eventId/assignments
 * List assignments for an event.
 */
export const getAssignments = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);

    const filter = {
      $or: [
        { event: eventId },
        { eventId },
        ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.roleId) {
      filter.role = req.query.roleId;
    }
    if (req.query.shiftId) {
      filter.shift = req.query.shiftId;
    }

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, assignments, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/assignments
 * Assign a volunteer to a role and shift with conflict prevention.
 */
export const createAssignment = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { volunteerId, roleId, shiftId } = req.body || {};

    if (!volunteerId) {
      return sendError(res, 'Volunteer ID is required', 'VALIDATION_ERROR', 400);
    }
    if (!roleId) {
      return sendError(res, 'Role ID is required', 'VALIDATION_ERROR', 400);
    }

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

    // Conflict prevention: check if volunteer already has an active assignment for this shift
    if (shiftId) {
      const isShiftObjectId = mongoose.Types.ObjectId.isValid(shiftId);
      const conflict = await Assignment.findOne({
        volunteer: volunteer._id,
        $or: [
          { shift: shiftId },
          ...(isShiftObjectId ? [{ shift: new mongoose.Types.ObjectId(shiftId) }] : []),
        ],
        status: { $in: ['assigned', 'checked_in'] },
      });

      if (conflict) {
        return sendError(
          res,
          'Volunteer already has an active assignment for this shift',
          'SCHEDULE_CONFLICT',
          400
        );
      }
    }

    const isEventObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const isRoleObjectId = mongoose.Types.ObjectId.isValid(roleId);
    const isShiftObjectId = shiftId && mongoose.Types.ObjectId.isValid(shiftId);

    const assignment = await Assignment.create({
      event: isEventObjectId ? new mongoose.Types.ObjectId(eventId) : eventId,
      eventId,
      volunteer: volunteer._id,
      volunteerId: volunteer._id.toString(),
      role: isRoleObjectId ? new mongoose.Types.ObjectId(roleId) : roleId,
      roleId,
      shift: isShiftObjectId ? new mongoose.Types.ObjectId(shiftId) : shiftId || null,
      shiftId: shiftId || null,
      status: 'assigned',
    });

    // Mark volunteer status
    volunteer.status = 'assigned';
    await volunteer.save();

    await logActivity(
      eventId,
      'assignment_created',
      `Volunteer ${volunteer.name} assigned to role`,
      {
        assignmentId: assignment.id,
        volunteerId: volunteer.id,
        roleId,
        shiftId,
      }
    );

    return sendSuccess(res, assignment, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:eventId/assignments/:assignmentId
 * Remove an assignment.
 */
export const removeAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }

    await Assignment.deleteOne({ _id: assignment._id });
    return sendSuccess(res, { message: 'Assignment removed successfully' }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/assignments/:assignmentId/check-in
 * Check in a volunteer for an assignment.
 */
export const checkIn = async (req, res, next) => {
  try {
    const { eventId, assignmentId } = req.params;
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }

    if (assignment.status === 'checked_in') {
      return sendSuccess(res, assignment, 200);
    }

    assignment.status = 'checked_in';
    assignment.checkedInAt = new Date();
    await assignment.save();

    await logActivity(
      eventId,
      'volunteer_check_in',
      `Volunteer checked in for assignment`,
      { assignmentId: assignment.id }
    );

    return sendSuccess(res, assignment, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/assignments/:assignmentId/check-out
 * Check out a volunteer, calculate hours worked, and update total hours.
 */
export const checkOut = async (req, res, next) => {
  try {
    const { eventId, assignmentId } = req.params;
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }

    if (!assignment.checkedInAt) {
      return sendError(res, 'Cannot check out without prior check-in', 'INVALID_ACTION', 400);
    }

    assignment.checkedOutAt = new Date();
    assignment.status = 'completed';

    const diffHours =
      (assignment.checkedOutAt.getTime() - new Date(assignment.checkedInAt).getTime()) /
      (1000 * 60 * 60);
    assignment.hoursWorked = Math.max(0, Math.round(diffHours * 10) / 10);
    await assignment.save();

    // Update volunteer total hours
    await Volunteer.updateOne(
      { _id: assignment.volunteer },
      { $inc: { totalHours: assignment.hoursWorked } }
    );

    await logActivity(
      eventId,
      'volunteer_check_out',
      `Volunteer checked out, worked ${assignment.hoursWorked} hours`,
      { assignmentId: assignment.id, hoursWorked: assignment.hoursWorked }
    );

    return sendSuccess(res, assignment, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/assignments/:assignmentId/dropout
 * Mark volunteer as dropped out and vacate slot.
 */
export const markDropout = async (req, res, next) => {
  try {
    const { eventId, assignmentId } = req.params;
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      return sendError(res, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND', 404);
    }

    assignment.status = 'dropped';
    await assignment.save();

    await Volunteer.updateOne({ _id: assignment.volunteer }, { status: 'dropped' });

    await logActivity(
      eventId,
      'volunteer_dropout',
      `Volunteer dropped out from assignment`,
      { assignmentId: assignment.id }
    );

    return sendSuccess(res, assignment, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/roles/:roleId/suggestions
 * Recommend ranked eligible replacement candidates.
 */
export const getSuggestions = async (req, res, next) => {
  try {
    const { eventId, roleId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(roleId);

    const role = await Role.findOne({
      $or: [
        { _id: roleId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(roleId) }] : []),
      ],
    });

    if (!role) {
      return sendError(res, 'Role not found', 'ROLE_NOT_FOUND', 404);
    }

    const requiredSkills = role.requiredSkills || [];

    // Find available volunteers
    const volunteers = await Volunteer.find({
      status: { $ne: 'dropped' },
    });

    const scoredCandidates = volunteers.map((vol) => {
      let score = 50;
      const reasons = [];

      // Skill match
      const matchingSkills = (vol.skills || []).filter((s) => requiredSkills.includes(s));
      if (matchingSkills.length > 0) {
        score += 30;
        reasons.push(`Matching skills: ${matchingSkills.join(', ')}`);
      }

      // Workload fairness: lower hours scores higher
      const hours = vol.totalHours || 0;
      if (hours <= 5) {
        score += 20;
        reasons.push('Low current workload');
      } else if (hours <= 10) {
        score += 10;
        reasons.push('Moderate workload');
      }

      return {
        volunteerId: vol.id || vol._id.toString(),
        name: vol.name,
        score: Math.min(100, score),
        reasons,
      };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    return sendSuccess(res, scoredCandidates.slice(0, 3), 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/coverage
 * Coverage calculations by zone and role.
 */
export const getCoverage = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);

    const refQuery = {
      $or: [
        { event: eventId },
        { eventId },
        ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    };

    const [zones, roles, assignments] = await Promise.all([
      Zone.find(refQuery),
      Role.find(refQuery),
      Assignment.find({
        ...refQuery,
        status: { $in: ['assigned', 'checked_in', 'completed'] },
      }),
    ]);

    const requiredTotal = roles.reduce(
      (sum, r) => sum + (Number(r.requiredCount || r.capacity) || 0),
      0
    );
    const filledTotal = assignments.length;
    const coveragePercent =
      requiredTotal > 0 ? Math.round((filledTotal / requiredTotal) * 100) : 0;

    const zoneCoverage = zones.map((zone) => {
      return {
        zoneId: zone.id,
        name: zone.name,
        capacity: zone.capacity,
      };
    });

    return sendSuccess(
      res,
      {
        overall: {
          filled: filledTotal,
          required: requiredTotal,
          percent: coveragePercent,
        },
        zones: zoneCoverage,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};
