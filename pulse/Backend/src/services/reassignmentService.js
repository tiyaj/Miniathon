import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import { checkHardConstraints, findCandidateRecommendations } from './matchingService.js';
import { populateAssignment } from './attendanceService.js';
import { logActivity } from '../models/Activity.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

/**
 * Get suggestions for a dropped assignment vacancy or role vacancy
 */
export const getVacancySuggestions = async (eventId, targetId) => {
  // Check if targetId is an Assignment
  const isObjectId = mongoose.Types.ObjectId.isValid(targetId);
  const assignment = await Assignment.findOne({
    $or: [
      { _id: targetId },
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(targetId) }] : []),
    ],
  }).populate('shift').populate('role');

  if (assignment) {
    if (assignment.status !== 'dropped') {
      const err = new Error('Suggestions are only available for vacant dropped slots');
      err.statusCode = 400;
      err.code = 'NOT_A_VACANCY';
      throw err;
    }
    const recommendations = await findCandidateRecommendations(
      eventId || assignment.eventId,
      assignment.shift,
      assignment.role
    );
    return {
      vacancy: {
        assignmentId: assignment.id || assignment._id.toString(),
        shift: assignment.shift,
        role: assignment.role,
        status: assignment.status,
      },
      recommendations,
    };
  }

  // Otherwise check if targetId is a Role
  const role = await Role.findOne({
    $or: [
      { _id: targetId },
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(targetId) }] : []),
    ],
  });

  if (!role) {
    const err = new Error('Role or Assignment not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const shift = await Shift.findOne({
    $or: [
      { event: eventId },
      { eventId },
    ],
  });

  const recommendations = await findCandidateRecommendations(eventId, shift, role);
  return recommendations;
};

/**
 * Replace a dropped assignment by creating a new assignment record
 */
export const replaceDroppedAssignment = async (eventId, assignmentId, volunteerId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(assignmentId);
  const droppedAssignment = await Assignment.findOne({
    $or: [
      { _id: assignmentId },
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(assignmentId) }] : []),
    ],
  }).populate('shift').populate('role');

  if (!droppedAssignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    err.code = 'ASSIGNMENT_NOT_FOUND';
    throw err;
  }

  if (droppedAssignment.status !== 'dropped') {
    const err = new Error('Only dropped assignments can be replaced');
    err.statusCode = 400;
    err.code = 'NOT_A_VACANCY';
    throw err;
  }

  const isVolObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
  const replacementVolunteer = await Volunteer.findOne({
    $or: [
      { _id: volunteerId },
      ...(isVolObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
    ],
  });

  if (!replacementVolunteer) {
    const err = new Error('Volunteer not found');
    err.statusCode = 404;
    err.code = 'VOLUNTEER_NOT_FOUND';
    throw err;
  }

  // Validate hard constraints
  const constraintCheck = await checkHardConstraints(
    replacementVolunteer,
    droppedAssignment.shift,
    droppedAssignment.role,
    eventId || droppedAssignment.eventId
  );

  if (!constraintCheck.eligible) {
    if (constraintCheck.isOverlap || constraintCheck.reason.includes('overlapping')) {
      const err = new Error(constraintCheck.reason);
      err.statusCode = 409;
      err.code = 'VOLUNTEER_DOUBLE_BOOKED';
      throw err;
    }
    const err = new Error(`Candidate volunteer is ineligible: ${constraintCheck.reason}`);
    err.statusCode = 400;
    err.code = 'INELIGIBLE_VOLUNTEER';
    throw err;
  }

  // Check role capacity
  const roleIdStr = (droppedAssignment.role?._id || droppedAssignment.roleId).toString();
  const shiftIdStr = (droppedAssignment.shift?._id || droppedAssignment.shiftId)?.toString();

  const activeRoleCount = await Assignment.countDocuments({
    $and: [
      {
        $or: [
          { role: droppedAssignment.role?._id },
          { roleId: roleIdStr },
        ],
      },
      {
        $or: [
          { shift: droppedAssignment.shift?._id },
          { shiftId: shiftIdStr },
        ],
      },
      {
        status: { $nin: INACTIVE_STATUSES },
      },
    ],
  });

  const capacity = Number(droppedAssignment.role?.requiredCount || droppedAssignment.role?.capacity) || 1;
  if (activeRoleCount >= capacity) {
    const err = new Error('Role capacity is already full for this shift');
    err.statusCode = 409;
    err.code = 'ROLE_FULL';
    throw err;
  }

  // Create NEW assignment preserving original dropped assignment for audit
  const newAssignment = await Assignment.create({
    event: droppedAssignment.event,
    eventId: eventId || droppedAssignment.eventId,
    shift: droppedAssignment.shift?._id || droppedAssignment.shift,
    shiftId: shiftIdStr,
    role: droppedAssignment.role?._id || droppedAssignment.role,
    roleId: roleIdStr,
    volunteer: replacementVolunteer._id,
    volunteerId: replacementVolunteer.id || replacementVolunteer._id.toString(),
    status: 'assigned',
  });

  replacementVolunteer.status = 'assigned';
  await replacementVolunteer.save();

  const evtId = eventId || droppedAssignment.eventId;
  if (evtId) {
    await logActivity(
      evtId,
      'volunteer_reassigned',
      `Replaced dropped slot with ${replacementVolunteer.name}`,
      {
        originalAssignmentId: droppedAssignment.id || droppedAssignment._id.toString(),
        newAssignmentId: newAssignment.id || newAssignment._id.toString(),
        volunteerId: replacementVolunteer.id || replacementVolunteer._id.toString(),
      }
    );
  }

  const populatedReplacement = await populateAssignment(Assignment.findById(newAssignment._id));
  const populatedDropped = await populateAssignment(Assignment.findById(droppedAssignment._id));

  return {
    droppedAssignment: populatedDropped,
    replacementAssignment: populatedReplacement,
  };
};

export default {
  getVacancySuggestions,
  replaceDroppedAssignment,
};
