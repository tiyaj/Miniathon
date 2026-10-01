import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import { logActivity } from '../models/Activity.js';

export const populateAssignment = (query) => {
  return query
    .populate('volunteer', 'name email phone skills totalHours status')
    .populate({
      path: 'shift',
      select: 'name startTime endTime startAt endAt zone event',
      populate: { path: 'zone', select: 'name capacity coordinatorName' },
    })
    .populate('role', 'name capacity requiredCount requiredSkills priority')
    .populate('event', 'name venue startTime endTime startAt endAt status');
};

const findAssignmentDoc = async (assignmentId) => {
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
 * Check-in volunteer for an assignment
 */
export const checkInAssignment = async (eventId, assignmentId) => {
  const assignment = await findAssignmentDoc(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    err.code = 'ASSIGNMENT_NOT_FOUND';
    throw err;
  }

  // Idempotent if already checked in
  if (assignment.status === 'checked_in') {
    return await populateAssignment(Assignment.findById(assignment._id));
  }

  if (['dropped', 'cancelled', 'completed', 'no_show'].includes(assignment.status)) {
    const err = new Error(`Cannot check in an assignment in '${assignment.status}' state`);
    err.statusCode = 400;
    err.code = 'INVALID_ATTENDANCE_STATE';
    throw err;
  }

  assignment.status = 'checked_in';
  assignment.checkedInAt = new Date();
  await assignment.save();

  // Update volunteer status
  if (assignment.volunteer) {
    await Volunteer.updateOne(
      { _id: assignment.volunteer },
      { $set: { status: 'checked_in' } }
    );
  }

  // Log activity
  const evtId = eventId || assignment.eventId || (assignment.event?._id || assignment.event)?.toString();
  if (evtId) {
    await logActivity(
      evtId,
      'volunteer_check_in',
      'Volunteer checked in for assignment',
      { assignmentId: assignment.id || assignment._id.toString() }
    );
  }

  return await populateAssignment(Assignment.findById(assignment._id));
};

/**
 * Check-out volunteer from an assignment and calculate hours worked
 */
export const checkOutAssignment = async (eventId, assignmentId) => {
  const assignment = await findAssignmentDoc(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    err.code = 'ASSIGNMENT_NOT_FOUND';
    throw err;
  }

  if (assignment.status === 'completed') {
    const err = new Error('Assignment is already completed');
    err.statusCode = 400;
    err.code = 'INVALID_ATTENDANCE_STATE';
    throw err;
  }

  if (!assignment.checkedInAt) {
    const err = new Error('Cannot check out without prior check-in');
    err.statusCode = 400;
    err.code = 'INVALID_ATTENDANCE_STATE';
    throw err;
  }

  const checkOutTime = new Date();
  const diffMs = checkOutTime.getTime() - new Date(assignment.checkedInAt).getTime();
  const rawHours = Math.max(0, diffMs) / 3600000;
  const hoursWorked = Math.round(rawHours * 100) / 100;

  assignment.checkedOutAt = checkOutTime;
  assignment.hoursWorked = hoursWorked;
  assignment.status = 'completed';
  await assignment.save();

  // Increment volunteer totalHours idempotently
  if (assignment.volunteer) {
    await Volunteer.updateOne(
      { _id: assignment.volunteer },
      {
        $inc: { totalHours: hoursWorked },
        $set: { status: 'available' },
      }
    );
  }

  const evtId = eventId || assignment.eventId || (assignment.event?._id || assignment.event)?.toString();
  if (evtId) {
    await logActivity(
      evtId,
      'volunteer_check_out',
      `Volunteer checked out, worked ${hoursWorked} hours`,
      { assignmentId: assignment.id || assignment._id.toString(), hoursWorked }
    );
  }

  return await populateAssignment(Assignment.findById(assignment._id));
};

/**
 * Mark assignment as dropped out
 */
export const dropoutAssignment = async (eventId, assignmentId) => {
  const assignment = await findAssignmentDoc(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    err.code = 'ASSIGNMENT_NOT_FOUND';
    throw err;
  }

  if (assignment.status === 'dropped') {
    const err = new Error('Assignment is already dropped');
    err.statusCode = 400;
    err.code = 'INVALID_ATTENDANCE_STATE';
    throw err;
  }

  if (assignment.status === 'completed') {
    const err = new Error('Cannot drop a completed assignment');
    err.statusCode = 400;
    err.code = 'INVALID_ATTENDANCE_STATE';
    throw err;
  }

  assignment.status = 'dropped';
  await assignment.save();

  if (assignment.volunteer) {
    await Volunteer.updateOne(
      { _id: assignment.volunteer },
      { $set: { status: 'dropped' } }
    );
  }

  const evtId = eventId || assignment.eventId || (assignment.event?._id || assignment.event)?.toString();
  if (evtId) {
    await logActivity(
      evtId,
      'volunteer_dropout',
      'Volunteer dropped out from assignment',
      { assignmentId: assignment.id || assignment._id.toString() }
    );
  }

  return await populateAssignment(Assignment.findById(assignment._id));
};

export default {
  populateAssignment,
  checkInAssignment,
  checkOutAssignment,
  dropoutAssignment,
};
