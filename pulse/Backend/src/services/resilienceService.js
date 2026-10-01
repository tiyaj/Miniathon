import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import { checkHardConstraints } from './matchingService.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

/**
 * Determine risk level from numeric risk score (0 to 100)
 */
export const getRiskLevel = (riskScore) => {
  if (riskScore >= 65) return 'high';
  if (riskScore >= 35) return 'medium';
  return 'low';
};

/**
 * Helper 1: Coverage and vacancy deficit (0 to 55 points)
 * Dominant operational risk signal: current unfilled vacancies directly threaten event execution.
 */
export const computeCoverageDeficit = (required, filled, vacancies) => {
  const reasons = [];
  if (required === 0) {
    return { score: 0, coveragePercent: 100, reasons };
  }

  const coveragePercent = Math.round((filled / required) * 100);

  let score = 0;
  if (coveragePercent === 100 && vacancies === 0) {
    score = 0;
  } else if (coveragePercent >= 90) {
    score = Math.round((100 - coveragePercent) * 1.5); // 0 to 15 pts
    reasons.push(`Coverage is at ${coveragePercent}% with ${vacancies} unfilled ${vacancies === 1 ? 'vacancy' : 'vacancies'}`);
  } else if (coveragePercent >= 75) {
    score = Math.round(15 + (90 - coveragePercent) * 0.7); // 15 to 25 pts
    reasons.push(`Coverage is below 90% (${coveragePercent}%) with ${vacancies} unfilled ${vacancies === 1 ? 'vacancy' : 'vacancies'}`);
  } else if (coveragePercent >= 50) {
    score = Math.round(25 + (75 - coveragePercent) * 0.6); // 25 to 40 pts
    reasons.push(`Coverage is below 75% (${coveragePercent}%) with ${vacancies} unfilled ${vacancies === 1 ? 'vacancy' : 'vacancies'}`);
  } else if (coveragePercent >= 25) {
    score = Math.round(40 + (50 - coveragePercent) * 0.4); // 40 to 50 pts
    reasons.push(`Severe coverage deficit (${coveragePercent}%) with ${vacancies} unfilled ${vacancies === 1 ? 'vacancy' : 'vacancies'}`);
  } else {
    score = Math.min(55, Math.round(50 + (25 - coveragePercent) * 0.2)); // 50 to 55 pts
    reasons.push(`Critical coverage deficit: only ${coveragePercent}% of required volunteers are currently assigned (${vacancies} unfilled ${vacancies === 1 ? 'vacancy' : 'vacancies'})`);
  }

  return { score, coveragePercent, reasons };
};

/**
 * Helper 2: Replacement volunteer buffer / depth (0 to 30 points)
 * Evaluates recovery capacity (ability to replace dropouts).
 * NOTE: Replacement pool represents recovery potential, NOT current staffing.
 */
export const computeReplacementBuffer = (eligibleCount, vacancies, required) => {
  const reasons = [];

  let score = 0;
  if (eligibleCount === 0) {
    score = 30;
    reasons.push('Zero eligible replacement volunteers available in pool');
  } else if (eligibleCount === 1) {
    score = 20;
    reasons.push('Critical replacement bottleneck: only 1 eligible replacement volunteer available');
  } else if (eligibleCount === 2) {
    score = 10;
    reasons.push('Limited replacement buffer: only 2 eligible replacement volunteers available');
  } else if (eligibleCount < vacancies) {
    score = 15;
    reasons.push(`Eligible replacements (${eligibleCount}) cannot cover all vacancies (${vacancies})`);
  } else {
    score = 0;
    if (vacancies > 0) {
      reasons.push(`Recovery capability: ${eligibleCount} eligible replacement volunteer candidates available in pool`);
    }
  }

  return { score, reasons };
};

/**
 * Helper 3: Dropout history & turnover instability (0 to 15 points)
 */
export const computeDropoutInstability = (droppedCount) => {
  const reasons = [];
  let score = 0;

  if (droppedCount >= 3) {
    score = 15;
    reasons.push(`High turnover instability: ${droppedCount} previous volunteer dropouts recorded`);
  } else if (droppedCount === 2) {
    score = 10;
    reasons.push(`Elevated dropout history: 2 volunteer dropouts recorded in this area`);
  } else if (droppedCount === 1) {
    score = 5;
    reasons.push('Area has experienced 1 previous volunteer dropout');
  }

  return { score, reasons };
};

/**
 * Helper 4: Assigned volunteer workload stress (0 to 10 points)
 */
export const computeWorkloadStress = (assignedVolunteers) => {
  const reasons = [];
  if (!assignedVolunteers || assignedVolunteers.length === 0) {
    return { score: 0, avgHours: 0, reasons };
  }

  const totalHoursSum = assignedVolunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0);
  const avgHours = Math.round((totalHoursSum / assignedVolunteers.length) * 10) / 10;

  let score = 0;
  if (avgHours >= 15) {
    score = 10;
    reasons.push(`Assigned volunteers have high workload accumulation (average ${avgHours} hrs), increasing fatigue risk`);
  } else if (avgHours >= 10) {
    score = 5;
    reasons.push(`Assigned volunteers have moderate workload accumulation (average ${avgHours} hrs)`);
  }

  return { score, avgHours, reasons };
};

/**
 * Helper 5: Structural dependency and role criticality (0 to 10 points)
 */
export const computeStructuralDependency = (roles, shifts, coveragePercent, eligibleCount) => {
  const reasons = [];
  let score = 0;

  // Single shift dependency
  if (shifts && shifts.length === 1 && roles.length > 0) {
    score += 4;
    reasons.push('The zone depends heavily on a single shift');
  }

  // Critical/High-priority role staffing risk
  const hasCriticalRole = roles.some((r) => {
    const name = (r.name || '').toLowerCase();
    const prio = (r.priority || '').toLowerCase();
    return prio === 'high' || name.includes('first aid') || name.includes('lead') || name.includes('emergency');
  });

  if (hasCriticalRole) {
    if (coveragePercent < 100 || eligibleCount <= 1) {
      score += 6;
      reasons.push('Contains critical/high-priority roles with vulnerable or unfilled staffing');
    } else {
      score += 2;
    }
  }

  score = Math.min(10, score);
  return { score, reasons };
};

/**
 * Find count of eligible replacement volunteers for a zone using matching constraint rules
 */
export const findEligibleReplacementsForZone = async (
  eventId,
  zoneRoles,
  zoneShifts,
  allVolunteers,
  assignmentsPool = null
) => {
  if (!zoneRoles || zoneRoles.length === 0 || !zoneShifts || zoneShifts.length === 0) {
    return allVolunteers.filter((v) => !INACTIVE_STATUSES.includes(v.status)).length;
  }

  const role = zoneRoles[0];
  const shift = zoneShifts[0];

  let eligible = 0;
  for (const vol of allVolunteers) {
    if (INACTIVE_STATUSES.includes(vol.status)) continue;

    const constraintCheck = await checkHardConstraints(
      vol,
      shift,
      role,
      eventId,
      assignmentsPool
    );
    if (constraintCheck.eligible) {
      eligible++;
    }
  }

  return eligible;
};

/**
 * Pure calculation helper that computes resilience from in-memory objects.
 */
export const computeResilienceFromData = async (
  event,
  zones,
  shifts,
  roles,
  assignments,
  allVolunteers,
  eventId,
  assignmentsPool = null
) => {
  const activeAssignments = assignments.filter((a) => !INACTIVE_STATUSES.includes(a.status));
  const droppedAssignments = assignments.filter((a) => a.status === 'dropped');

  let totalVacancies = 0;
  let totalRequiredSum = 0;
  let totalAssignedSum = 0;
  const areas = [];

  for (const zone of zones) {
    const zoneIdStr = (zone.id || zone._id).toString();

    // Shifts associated with this zone
    const zoneShifts = shifts.filter((s) => {
      return (s.zone || s.zoneId)?.toString() === zoneIdStr;
    });
    const zoneShiftIds = zoneShifts.map((s) => (s.id || s._id).toString());

    // Roles associated with this zone
    let zoneRoles = roles.filter((r) => {
      return (r.zone || r.zoneId)?.toString() === zoneIdStr;
    });

    if (zoneRoles.length === 0 && zoneShiftIds.length > 0) {
      zoneRoles = roles.filter((r) => {
        const rShiftId = (r.shift || r.shiftId)?.toString();
        return rShiftId && zoneShiftIds.includes(rShiftId);
      });
    }

    const zoneRoleIds = zoneRoles.map((r) => (r.id || r._id).toString());

    // Active & Dropped Assignments in Zone
    const zoneActiveAssignments = activeAssignments.filter((a) => {
      const aRoleId = (a.role?._id || a.roleId || a.role)?.toString();
      const aShiftId = (a.shift?._id || a.shiftId || a.shift)?.toString();
      const matchRole = roles.find((r) => (r._id || r.id).toString() === aRoleId);
      if ((matchRole?.zone || matchRole?.zoneId)?.toString() === zoneIdStr) return true;
      if (aShiftId && zoneShiftIds.includes(aShiftId)) return true;
      if (zoneRoleIds.includes(aRoleId)) return true;
      return false;
    });

    const zoneDroppedAssignments = droppedAssignments.filter((a) => {
      const aRoleId = (a.role?._id || a.roleId || a.role)?.toString();
      const aShiftId = (a.shift?._id || a.shiftId || a.shift)?.toString();
      const matchRole = roles.find((r) => (r._id || r.id).toString() === aRoleId);
      if ((matchRole?.zone || matchRole?.zoneId)?.toString() === zoneIdStr) return true;
      if (aShiftId && zoneShiftIds.includes(aShiftId)) return true;
      if (zoneRoleIds.includes(aRoleId)) return true;
      return false;
    });

    // Required volunteer count calculation
    let required = 0;
    if (zoneRoles.length > 0) {
      required = zoneRoles.reduce((sum, r) => sum + (Number(r.requiredCount || r.capacity) || 1), 0);
    } else if (zoneActiveAssignments.length > 0) {
      required = zoneActiveAssignments.length;
    } else if (zone.capacity && zone.capacity <= 50) {
      required = zone.capacity;
    } else if (zone.capacity && zone.capacity > 50) {
      required = Math.max(zoneActiveAssignments.length, 5);
    } else {
      required = 1;
    }

    const filled = zoneActiveAssignments.length;
    const vacancies = Math.max(0, required - filled);
    totalVacancies += vacancies;
    totalRequiredSum += required;
    totalAssignedSum += filled;

    // Eligible replacements
    const eligibleReplacements = await findEligibleReplacementsForZone(
      eventId,
      zoneRoles,
      zoneShifts.length > 0 ? zoneShifts : shifts,
      allVolunteers,
      assignmentsPool
    );

    // Assigned Volunteers details for workload stress
    const assignedVolIds = zoneActiveAssignments.map((a) => (a.volunteer?._id || a.volunteerId || a.volunteer)?.toString());
    const assignedVolunteers = allVolunteers.filter((v) =>
      assignedVolIds.includes((v._id || v.id).toString())
    );

    // Compute Risk Components
    const coverageComp = computeCoverageDeficit(required, filled, vacancies);
    const bufferComp = computeReplacementBuffer(eligibleReplacements, vacancies, required);
    const dropoutComp = computeDropoutInstability(zoneDroppedAssignments.length);
    const workloadComp = computeWorkloadStress(assignedVolunteers);
    const dependencyComp = computeStructuralDependency(
      zoneRoles,
      zoneShifts,
      coverageComp.coveragePercent,
      eligibleReplacements
    );

    const rawScore = Math.min(
      100,
      Math.max(
        0,
        coverageComp.score +
          bufferComp.score +
          dropoutComp.score +
          workloadComp.score +
          dependencyComp.score
      )
    );

    // Apply Zone Operational Risk Floors:
    // Severe undercoverage cannot be masked by replacement buffer
    let combinedScore = rawScore;
    if (coverageComp.coveragePercent < 25 && required > 0) {
      combinedScore = Math.max(rawScore, 65); // High risk floor
      if (eligibleReplacements > 0 && vacancies > 0) {
        coverageComp.reasons.push(
          'Although replacement capacity is available, current staffing remains critically below operational requirements'
        );
      }
    } else if (coverageComp.coveragePercent < 50 && required > 0) {
      combinedScore = Math.max(rawScore, 45); // Medium risk floor (cannot be low)
    } else if (coverageComp.coveragePercent < 75 && required > 0) {
      combinedScore = Math.max(rawScore, 35); // Medium risk floor (cannot be low)
    }

    const riskLevel = getRiskLevel(combinedScore);
    const resilienceScore = 100 - combinedScore;

    const allReasons = [
      ...coverageComp.reasons,
      ...bufferComp.reasons,
      ...dropoutComp.reasons,
      ...workloadComp.reasons,
      ...dependencyComp.reasons,
    ];

    if (allReasons.length === 0) {
      allReasons.push('Strong staffing coverage with adequate volunteer replacement buffers');
    }

    areas.push({
      zoneId: zoneIdStr,
      zoneName: zone.name,
      coordinatorName: zone.coordinatorName || null,
      riskLevel,
      riskScore: combinedScore,
      resilienceScore,
      coveragePercent: coverageComp.coveragePercent,
      required,
      assigned: filled,
      vacancies,
      eligibleReplacements,
      reasons: allReasons,
      breakdown: {
        coverageScore: coverageComp.score,
        bufferScore: bufferComp.score,
        dropoutScore: dropoutComp.score,
        workloadScore: workloadComp.score,
        dependencyScore: dependencyComp.score,
      },
    });
  }

  // Summary counts
  const highRiskAreas = areas.filter((a) => a.riskLevel === 'high').length;
  const mediumRiskAreas = areas.filter((a) => a.riskLevel === 'medium').length;
  const lowRiskAreas = areas.filter((a) => a.riskLevel === 'low').length;

  // Effective event total required based on role definitions and zone sums
  const eventRoleRequired = roles.reduce(
    (sum, r) => sum + (Number(r.requiredCount || r.capacity) || 1),
    0
  );
  const effectiveRequired = Math.max(totalRequiredSum, eventRoleRequired);
  const effectiveAssigned = totalAssignedSum;
  const effectiveVacancies = Math.max(0, effectiveRequired - effectiveAssigned);
  const eventCoveragePercent = effectiveRequired > 0
    ? Math.round((effectiveAssigned / effectiveRequired) * 100)
    : 100;

  // Overall Event Risk & Resilience Score: Staffing-weighted aggregation
  let eventRiskScore = 0;
  if (areas.length > 0) {
    const totalWeights = areas.reduce((sum, a) => sum + Math.max(a.required, 1), 0);
    const weightedRiskSum = areas.reduce((sum, a) => sum + a.riskScore * Math.max(a.required, 1), 0);
    eventRiskScore = Math.round(weightedRiskSum / totalWeights);
  } else {
    eventRiskScore = totalVacancies > 0 ? 50 : 0;
  }

  // Enforce Event-Level Semantic Guardrails:
  // Severe overall event undercoverage MUST NOT appear as Low Risk
  if (eventCoveragePercent < 25 && effectiveRequired > 0) {
    eventRiskScore = Math.max(eventRiskScore, 65); // High risk floor
  } else if (eventCoveragePercent < 50 && effectiveRequired > 0) {
    eventRiskScore = Math.max(eventRiskScore, 45); // Medium risk floor (cannot be low)
  } else if (eventCoveragePercent < 75 && effectiveRequired > 0) {
    eventRiskScore = Math.max(eventRiskScore, 35); // Medium risk floor (cannot be low)
  }

  const overallRiskLevel = getRiskLevel(eventRiskScore);
  const overallResilienceScore = 100 - eventRiskScore;

  // Sort areas by riskScore descending to identify most vulnerable
  const vulnerableAreas = [...areas]
    .sort((a, b) => b.riskScore - a.riskScore)
    .filter((a) => a.riskScore >= 35);

  return {
    eventId: (event._id || event.id).toString(),
    eventName: event.name,
    overallScore: overallResilienceScore,
    resilienceScore: overallResilienceScore,
    riskScore: eventRiskScore,
    riskLevel: overallRiskLevel,
    summary: {
      highRiskAreas,
      mediumRiskAreas,
      lowRiskAreas,
      totalVacancies: effectiveVacancies,
      totalRequired: effectiveRequired,
      totalAssigned: effectiveAssigned,
      totalAvailableVolunteers: allVolunteers.length,
      overallCoveragePercent: eventCoveragePercent,
    },
    vulnerableAreas,
    areas,
  };
};

/**
 * Calculate Event-level Resilience and Zone Breakdown.
 * Supports optional in-memory overrides for simulation.
 */
export const calculateEventResilience = async (
  eventId,
  { assignmentsPool = null, volunteersPool = null } = {}
) => {
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
  });

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

  const [zones, shifts, roles, dbAssignments, dbVolunteers] = await Promise.all([
    Zone.find(refQuery).sort({ name: 1 }),
    Shift.find(refQuery).sort({ startTime: 1 }),
    Role.find(refQuery).sort({ name: 1 }),
    assignmentsPool ? Promise.resolve(assignmentsPool) : Assignment.find(refQuery),
    volunteersPool
      ? Promise.resolve(volunteersPool)
      : Volunteer.find({
          $or: [
            { event: event._id },
            { eventId: event._id.toString() },
            { eventId: eventId.toString().trim() },
            { eventId: null, event: null },
          ],
          status: { $nin: ['dropped', 'dropout', 'no_show'] },
        }),
  ]);

  const assignments = assignmentsPool || dbAssignments;
  const allVolunteers = volunteersPool || dbVolunteers;

  return await computeResilienceFromData(
    event,
    zones,
    shifts,
    roles,
    assignments,
    allVolunteers,
    eventId,
    assignmentsPool
  );
};

export default {
  getRiskLevel,
  computeCoverageDeficit,
  computeReplacementBuffer,
  computeDropoutInstability,
  computeWorkloadStress,
  computeStructuralDependency,
  findEligibleReplacementsForZone,
  computeResilienceFromData,
  calculateEventResilience,
};
