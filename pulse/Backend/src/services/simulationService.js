import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import { checkHardConstraints, findCandidateRecommendations } from './matchingService.js';
import { computeResilienceFromData } from './resilienceService.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

/**
 * Validate simulation request body
 */
export const validateSimulationInput = (body) => {
  if (!body || typeof body !== 'object') {
    const err = new Error('Request body must be a valid JSON object');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const { dropoutVolunteerIds } = body;
  if (!dropoutVolunteerIds || !Array.isArray(dropoutVolunteerIds)) {
    const err = new Error('dropoutVolunteerIds must be an array of volunteer IDs');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (dropoutVolunteerIds.length === 0) {
    const err = new Error('dropoutVolunteerIds array cannot be empty');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const validIds = [];
  for (const id of dropoutVolunteerIds) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      const err = new Error('Each volunteer ID in dropoutVolunteerIds must be a non-empty string');
      err.statusCode = 400;
      err.code = 'INVALID_VOLUNTEER_ID';
      throw err;
    }
    const cleanId = id.trim();
    if (!validIds.includes(cleanId)) {
      validIds.push(cleanId);
    }
  }

  return validIds;
};

/**
 * Simulate disruption of volunteers dropping out in-memory without modifying MongoDB
 */
export const simulateDisruption = async (eventId, body) => {
  const dropoutVolunteerIds = validateSimulationInput(body);

  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    const err = new Error('Valid event ID is required');
    err.statusCode = 400;
    err.code = 'INVALID_EVENT_ID';
    throw err;
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(eventId.trim());
  const event = await Event.findOne({
    $or: [
      { _id: eventId },
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(eventId.trim()) }] : []),
    ],
  }).lean();

  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    err.code = 'EVENT_NOT_FOUND';
    throw err;
  }

  const refQuery = {
    $or: [
      { event: event._id },
      { eventId: event._id.toString() },
      { eventId: eventId.toString().trim() },
      ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId.trim()) }] : []),
    ],
  };

  // 1. Load current database state read-only using lean()
  const [zones, shifts, roles, rawAssignments, rawVolunteers] = await Promise.all([
    Zone.find(refQuery).sort({ name: 1 }).lean(),
    Shift.find(refQuery).sort({ startTime: 1 }).lean(),
    Role.find(refQuery).sort({ name: 1 }).lean(),
    Assignment.find(refQuery).populate('shift').populate('role').lean(),
    Volunteer.find({
      $or: [
        { event: event._id },
        { eventId: event._id.toString() },
        { eventId: eventId.toString().trim() },
        { eventId: null, event: null },
      ],
    }).lean(),
  ]);

  // 2. Validate requested volunteer IDs
  const simulatedDropouts = [];
  for (const vId of dropoutVolunteerIds) {
    let vol = rawVolunteers.find(
      (v) => (v.id || v._id).toString() === vId
    );

    if (!vol) {
      // Check if volunteer exists globally in database to distinguish between NOT_FOUND and EVENT_MISMATCH
      const isVolIdObj = mongoose.Types.ObjectId.isValid(vId);
      const foreignVolCheck = await Volunteer.findOne({
        $or: [
          { _id: vId },
          ...(isVolIdObj ? [{ _id: new mongoose.Types.ObjectId(vId) }] : []),
        ],
      }).lean();

      if (foreignVolCheck) {
        const err = new Error(`Volunteer with ID '${vId}' belongs to another event`);
        err.statusCode = 400;
        err.code = 'VOLUNTEER_EVENT_MISMATCH';
        throw err;
      }

      const err = new Error(`Volunteer with ID '${vId}' not found`);
      err.statusCode = 404;
      err.code = 'VOLUNTEER_NOT_FOUND';
      throw err;
    }

    const volEvtStr = (vol.eventId || vol.event?._id || vol.event)?.toString();
    const currentEvtStr = (event._id || event.id).toString();
    if (volEvtStr && volEvtStr !== currentEvtStr && volEvtStr !== eventId.toString().trim()) {
      const err = new Error(`Volunteer with ID '${vId}' belongs to another event`);
      err.statusCode = 400;
      err.code = 'VOLUNTEER_EVENT_MISMATCH';
      throw err;
    }

    simulatedDropouts.push({
      volunteerId: (vol.id || vol._id).toString(),
      volunteerName: vol.name,
    });
  }

  // 3. Create independent deep clones for in-memory simulation
  const simulatedAssignments = JSON.parse(JSON.stringify(rawAssignments));
  const simulatedVolunteers = JSON.parse(JSON.stringify(rawVolunteers));

  // Identify affected active assignments
  const affectedAssignments = [];
  for (const assign of simulatedAssignments) {
    const aVolId = (assign.volunteer?._id || assign.volunteerId || assign.volunteer)?.toString();
    if (dropoutVolunteerIds.includes(aVolId) && !INACTIVE_STATUSES.includes(assign.status)) {
      assign.status = 'dropped';
      affectedAssignments.push(assign);
    }
  }

  // Mark volunteers as dropped in simulation
  for (const vol of simulatedVolunteers) {
    const vId = (vol.id || vol._id).toString();
    if (dropoutVolunteerIds.includes(vId)) {
      vol.status = 'dropped';
    }
  }

  // 4. Calculate Current vs Projected Coverage
  const totalRequired = roles.reduce(
    (sum, r) => sum + (Number(r.requiredCount || r.capacity) || 1),
    0
  );

  const currentActive = rawAssignments.filter((a) => !INACTIVE_STATUSES.includes(a.status));
  const currentAssigned = currentActive.length;
  const currentVacancies = Math.max(0, totalRequired - currentAssigned);
  const currentCoveragePercent = totalRequired > 0 ? Math.round((currentAssigned / totalRequired) * 100) : 100;

  const projectedActive = simulatedAssignments.filter((a) => !INACTIVE_STATUSES.includes(a.status));
  const projectedAssigned = projectedActive.length;
  const projectedVacancies = Math.max(0, totalRequired - projectedAssigned);
  const projectedCoveragePercent = totalRequired > 0 ? Math.round((projectedAssigned / totalRequired) * 100) : 100;

  const coverageChange = {
    coveragePercent: projectedCoveragePercent - currentCoveragePercent,
    additionalVacancies: projectedVacancies - currentVacancies,
  };

  // 5. Calculate Current and Projected Resilience
  const currentResilience = await computeResilienceFromData(
    event,
    zones,
    shifts,
    roles,
    rawAssignments,
    rawVolunteers,
    eventId
  );

  const projectedResilience = await computeResilienceFromData(
    event,
    zones,
    shifts,
    roles,
    simulatedAssignments,
    simulatedVolunteers,
    eventId,
    simulatedAssignments
  );

  // 6. Identify Affected Areas
  const affectedAreas = [];
  for (const zone of zones) {
    const zoneIdStr = (zone.id || zone._id).toString();

    // Check if zone lost assignments
    const zoneShifts = shifts.filter((s) => (s.zone || s.zoneId)?.toString() === zoneIdStr);
    const zoneShiftIds = zoneShifts.map((s) => (s._id || s.id).toString());

    // Roles in this Zone: directly or via shift
    const zoneRoles = roles.filter((r) => {
      const rZone = (r.zone || r.zoneId)?.toString();
      if (rZone === zoneIdStr) return true;
      const rShift = (r.shift || r.shiftId)?.toString();
      if (rShift && zoneShiftIds.includes(rShift)) return true;
      return false;
    });
    const zoneRoleIds = zoneRoles.map((r) => (r.id || r._id).toString());

    const zoneLostAssignments = affectedAssignments.filter((a) => {
      const aRoleId = (a.role?._id || a.roleId || a.role)?.toString();
      const aShiftId = (a.shift?._id || a.shiftId || a.shift)?.toString();
      const matchRole = roles.find((r) => (r._id || r.id).toString() === aRoleId);
      if ((matchRole?.zone || matchRole?.zoneId)?.toString() === zoneIdStr) return true;
      if (aShiftId && zoneShiftIds.includes(aShiftId)) return true;
      if (zoneRoleIds.includes(aRoleId)) return true;
      return false;
    });

    if (zoneLostAssignments.length > 0) {
      const currentZoneResil = currentResilience.areas.find((a) => a.zoneId === zoneIdStr);
      const projectedZoneResil = projectedResilience.areas.find((a) => a.zoneId === zoneIdStr);

      affectedAreas.push({
        zoneId: zoneIdStr,
        zoneName: zone.name,
        currentCoveragePercent: currentZoneResil ? currentZoneResil.coveragePercent : 100,
        projectedCoveragePercent: projectedZoneResil ? projectedZoneResil.coveragePercent : 0,
        additionalVacancies: zoneLostAssignments.length,
        riskLevel: projectedZoneResil ? projectedZoneResil.riskLevel : 'high',
      });
    }
  }

  // 7. Find Projected Replacements for each Affected Slot
  const replacementOptions = [];
  for (const assign of affectedAssignments) {
    const shift = assign.shift || shifts.find((s) => (s._id || s.id).toString() === (assign.shift || assign.shiftId)?.toString());
    const role = assign.role || roles.find((r) => (r._id || r.id).toString() === (assign.role || assign.roleId)?.toString());

    const zoneIdStr = (role?.zone || role?.zoneId || shift?.zone || shift?.zoneId)?.toString();
    const zone = zones.find((z) => (z._id || z.id).toString() === zoneIdStr);

    const candidates = await findCandidateRecommendations(
      eventId,
      shift,
      role,
      { volunteersPool: simulatedVolunteers, assignmentsPool: simulatedAssignments }
    );

    replacementOptions.push({
      assignmentId: (assign.id || assign._id).toString(),
      shiftId: shift ? (shift.id || shift._id).toString() : null,
      shiftName: shift ? shift.name : 'Unknown Shift',
      roleId: role ? (role.id || role._id).toString() : null,
      roleName: role ? role.name : 'Unknown Role',
      zoneId: zone ? (zone.id || zone._id).toString() : null,
      zoneName: zone ? zone.name : 'Unknown Zone',
      candidates,
    });
  }

  // 8. Multi-Vacancy Conflict-Aware Recovery Projection
  // Greedily schedule candidates ensuring no volunteer is double-booked across overlapping vacancies
  let replaceableAssignments = 0;
  let unrecoverableAssignments = 0;
  const provisionalAssignments = JSON.parse(JSON.stringify(simulatedAssignments));

  // Sort replacement options (High priority roles first)
  const sortedOptions = [...replacementOptions].sort((a, b) => {
    const roleA = roles.find((r) => (r._id || r.id).toString() === a.roleId);
    const roleB = roles.find((r) => (r._id || r.id).toString() === b.roleId);
    const prioScore = (r) => (r?.priority === 'High' ? 2 : r?.priority === 'Medium' ? 1 : 0);
    return prioScore(roleB) - prioScore(roleA);
  });

  for (const opt of sortedOptions) {
    const shift = shifts.find((s) => (s._id || s.id).toString() === opt.shiftId);
    const role = roles.find((r) => (r._id || r.id).toString() === opt.roleId);

    let filledSlot = false;
    for (const cand of opt.candidates) {
      const vol = simulatedVolunteers.find((v) => (v.id || v._id).toString() === cand.volunteerId);
      if (!vol) continue;

      // Test constraints against current provisional state
      const check = await checkHardConstraints(vol, shift, role, eventId, provisionalAssignments);
      if (check.eligible) {
        // Provisionally reserve this volunteer for this slot
        provisionalAssignments.push({
          event: event._id,
          eventId,
          shift,
          shiftId: opt.shiftId,
          role,
          roleId: opt.roleId,
          volunteer: vol,
          volunteerId: cand.volunteerId,
          status: 'assigned',
        });
        replaceableAssignments++;
        filledSlot = true;
        break;
      }
    }

    if (!filledSlot) {
      unrecoverableAssignments++;
    }
  }

  const projectedCoverageAfterSuggestedReplacements = totalRequired > 0
    ? Math.round(((projectedAssigned + replaceableAssignments) / totalRequired) * 100)
    : 100;

  const remainingVacancies = currentVacancies + unrecoverableAssignments;

  const recovery = {
    affectedAssignments: affectedAssignments.length,
    replaceableAssignments,
    unrecoverableAssignments,
    projectedCoverageAfterSuggestedReplacements,
    remainingVacancies,
  };

  // 9. Assemble and return final simulation result
  return {
    event: {
      id: (event._id || event.id).toString(),
      name: event.name,
    },
    simulatedDropouts,
    coverage: {
      current: {
        required: totalRequired,
        assigned: currentAssigned,
        vacancies: currentVacancies,
        coveragePercent: currentCoveragePercent,
      },
      projected: {
        required: totalRequired,
        assigned: projectedAssigned,
        vacancies: projectedVacancies,
        coveragePercent: projectedCoveragePercent,
      },
      change: coverageChange,
    },
    affectedAreas,
    replacementOptions,
    recovery,
    resilience: {
      current: {
        score: currentResilience.resilienceScore,
        riskScore: currentResilience.riskScore,
        riskLevel: currentResilience.riskLevel,
      },
      projected: {
        score: projectedResilience.resilienceScore,
        riskScore: projectedResilience.riskScore,
        riskLevel: projectedResilience.riskLevel,
      },
      change: projectedResilience.resilienceScore - currentResilience.resilienceScore,
    },
  };
};

export default {
  validateSimulationInput,
  simulateDisruption,
};
