import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import Assignment from '../models/Assignment.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

/**
 * Determine coverage status string per PRD: Open, Filled, At Risk, Overstaffed
 */
const getCoverageStatus = (required, filled) => {
  if (filled === 0 && required > 0) return 'Open';
  if (filled < required) return 'At Risk';
  if (filled === required) return 'Filled';
  if (filled > required) return 'Overstaffed';
  return 'Filled';
};

/**
 * Calculate dynamic event coverage by zone, role, and shift
 */
export const calculateEventCoverage = async (eventId, shiftId = null) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
  const refQuery = {
    $or: [
      { event: eventId },
      { eventId },
      ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
    ],
  };

  const [event, zones, shifts, roles, assignments] = await Promise.all([
    Event.findOne({
      $or: [
        { _id: eventId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    }),
    Zone.find(refQuery).sort({ name: 1 }),
    Shift.find(refQuery).sort({ startTime: 1 }),
    Role.find(refQuery).sort({ name: 1 }),
    Assignment.find({
      ...refQuery,
      status: { $nin: INACTIVE_STATUSES },
    }),
  ]);

  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    err.code = 'EVENT_NOT_FOUND';
    throw err;
  }

  // Calculate overall totals
  const totalRequired = roles.reduce(
    (sum, r) => sum + (Number(r.requiredCount || r.capacity) || 1),
    0
  );
  const totalFilled = assignments.length;
  const totalGap = Math.max(totalRequired - totalFilled, 0);
  const overallPercent = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 100;
  const overallStatus = getCoverageStatus(totalRequired, totalFilled);

  // Group by Zones
  const zonesCoverage = zones.map((zone) => {
    const zoneIdStr = (zone.id || zone._id).toString();
    const zoneRoles = roles.filter(
      (r) => (r.zone || r.zoneId)?.toString() === zoneIdStr
    );
    const required = zoneRoles.length > 0
      ? zoneRoles.reduce((s, r) => s + (Number(r.requiredCount || r.capacity) || 1), 0)
      : (zone.capacity || 0);

    const filled = assignments.filter((a) => {
      const matchRole = roles.find((r) => (r._id || r.id).toString() === (a.role || a.roleId)?.toString());
      return (matchRole?.zone || matchRole?.zoneId)?.toString() === zoneIdStr;
    }).length;

    const gap = Math.max(required - filled, 0);
    const percent = required > 0 ? Math.round((filled / required) * 100) : 100;
    const status = getCoverageStatus(required, filled);

    return {
      zoneId: zone.id || zone._id.toString(),
      name: zone.name,
      capacity: zone.capacity,
      coordinatorName: zone.coordinatorName,
      required,
      assigned: filled,
      filled,
      gap,
      percent,
      status,
    };
  });

  // Group by Shifts
  const shiftsCoverage = shifts.map((shift) => {
    const shiftIdStr = (shift.id || shift._id).toString();
    const shiftAssignments = assignments.filter(
      (a) => (a.shift || a.shiftId)?.toString() === shiftIdStr
    );
    const required = roles.reduce((s, r) => s + (Number(r.requiredCount || r.capacity) || 1), 0);
    const filled = shiftAssignments.length;
    const gap = Math.max(required - filled, 0);
    const percent = required > 0 ? Math.round((filled / required) * 100) : 100;
    const status = getCoverageStatus(required, filled);

    const rolesBreakdown = roles.map((role) => {
      const roleIdStr = (role.id || role._id).toString();
      const rReq = Number(role.requiredCount || role.capacity) || 1;
      const rFilled = shiftAssignments.filter(
        (a) => (a.role || a.roleId)?.toString() === roleIdStr
      ).length;
      const rGap = Math.max(rReq - rFilled, 0);
      const rPercent = rReq > 0 ? Math.round((rFilled / rReq) * 100) : 100;
      const rStatus = getCoverageStatus(rReq, rFilled);

      return {
        roleId: roleIdStr,
        name: role.name,
        required: rReq,
        assigned: rFilled,
        filled: rFilled,
        gap: rGap,
        percent: rPercent,
        status: rStatus,
      };
    });

    return {
      shiftId: shiftIdStr,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      required,
      assigned: filled,
      filled,
      gap,
      percent,
      status,
      roles: rolesBreakdown,
    };
  });

  return {
    eventId: (event._id || event.id).toString(),
    eventName: event.name,
    overall: {
      required: totalRequired,
      assigned: totalFilled,
      filled: totalFilled,
      gap: totalGap,
      percent: overallPercent,
      status: overallStatus,
    },
    zones: zonesCoverage,
    shifts: shiftsCoverage,
    roles: roles.map((r) => {
      const roleIdStr = (r.id || r._id).toString();
      const req = Number(r.requiredCount || r.capacity) || 1;
      const f = assignments.filter((a) => (a.role || a.roleId)?.toString() === roleIdStr).length;
      return {
        roleId: roleIdStr,
        name: r.name,
        required: req,
        assigned: f,
        filled: f,
        gap: Math.max(req - f, 0),
        percent: req > 0 ? Math.round((f / req) * 100) : 100,
        status: getCoverageStatus(req, f),
      };
    }),
  };
};

export default {
  calculateEventCoverage,
};
