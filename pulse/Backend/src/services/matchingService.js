import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Volunteer from '../models/Volunteer.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';

const INACTIVE_STATUSES = ['dropped', 'cancelled', 'no_show'];

/**
 * Check if a candidate volunteer satisfies all hard constraints.
 * Supports optional in-memory activeAssignmentsPool for zero-database simulation.
 */
export const checkHardConstraints = async (volunteer, shift, role, eventId, activeAssignmentsPool = null) => {
  if (!volunteer) {
    return { eligible: false, reason: 'Volunteer does not exist' };
  }

  // 1. Volunteer is active and not marked dropped / no_show
  if (['dropped', 'dropout', 'no_show'].includes(volunteer.status)) {
    return {
      eligible: false,
      reason: 'Volunteer is marked as dropped or inactive',
    };
  }

  // 2. Available for target shift
  if (shift && volunteer.availableShiftIds && Array.isArray(volunteer.availableShiftIds) && volunteer.availableShiftIds.length > 0) {
    const shiftIdStr = (shift.id || shift._id || shift).toString();
    const isShiftAvailable = volunteer.availableShiftIds.some(
      (sId) => (sId?.id || sId?._id || sId).toString() === shiftIdStr
    );
    if (!isShiftAvailable) {
      return {
        eligible: false,
        reason: 'Requested shift is not in volunteer available shifts',
      };
    }
  }

  // 3. Shift overlap / double booking check
  if (shift && shift.startTime && shift.endTime) {
    const requestedStart = new Date(shift.startTime).getTime();
    const requestedEnd = new Date(shift.endTime).getTime();

    let activeAssignments;
    if (Array.isArray(activeAssignmentsPool)) {
      const volIdStr = (volunteer.id || volunteer._id).toString();
      activeAssignments = activeAssignmentsPool.filter((a) => {
        const aVolIdStr = (a.volunteer?._id || a.volunteer || a.volunteerId)?.toString();
        return aVolIdStr === volIdStr && !INACTIVE_STATUSES.includes(a.status);
      });
    } else {
      const isVolObjectId = mongoose.Types.ObjectId.isValid(volunteer._id || volunteer.id);
      activeAssignments = await Assignment.find({
        $or: [
          { volunteer: volunteer._id },
          { volunteerId: (volunteer.id || volunteer._id).toString() },
          ...(isVolObjectId ? [{ volunteer: new mongoose.Types.ObjectId(volunteer._id || volunteer.id) }] : []),
        ],
        status: { $nin: INACTIVE_STATUSES },
      }).populate('shift');
    }

    for (const existingAssignment of activeAssignments) {
      const existingShift = existingAssignment.shift;
      if (!existingShift || !existingShift.startTime || !existingShift.endTime) continue;

      const existingStart = new Date(existingShift.startTime).getTime();
      const existingEnd = new Date(existingShift.endTime).getTime();

      // Interval overlap: existingStart < requestedEnd && existingEnd > requestedStart
      if (existingStart < requestedEnd && existingEnd > requestedStart) {
        return {
          eligible: false,
          isOverlap: true,
          reason: `Volunteer already has an overlapping active assignment for shift "${existingShift.name || 'Active Shift'}"`,
        };
      }
    }
  }

  // 4. Not already occupying target slot
  if (shift && role) {
    const shiftIdStr = (shift.id || shift._id || shift).toString();
    const roleIdStr = (role.id || role._id || role).toString();

    let existingSlot;
    if (Array.isArray(activeAssignmentsPool)) {
      const volIdStr = (volunteer.id || volunteer._id).toString();
      existingSlot = activeAssignmentsPool.find((a) => {
        const aVolIdStr = (a.volunteer?._id || a.volunteer || a.volunteerId)?.toString();
        const aShiftIdStr = (a.shift?._id || a.shift || a.shiftId)?.toString();
        const aRoleIdStr = (a.role?._id || a.role || a.roleId)?.toString();
        return (
          aVolIdStr === volIdStr &&
          aShiftIdStr === shiftIdStr &&
          aRoleIdStr === roleIdStr &&
          !INACTIVE_STATUSES.includes(a.status)
        );
      });
    } else {
      existingSlot = await Assignment.findOne({
        $and: [
          {
            $or: [
              { volunteer: volunteer._id },
              { volunteerId: (volunteer.id || volunteer._id).toString() },
            ],
          },
          {
            $or: [
              { shift: shift._id, role: role._id },
              { shiftId: shiftIdStr, roleId: roleIdStr },
            ],
          },
          {
            status: { $nin: INACTIVE_STATUSES },
          },
        ],
      });
    }

    if (existingSlot) {
      return {
        eligible: false,
        reason: 'Volunteer already occupies this target slot',
      };
    }
  }

  // 5. Skill match: At least 1 matching skill if role specifies skills.
  // For critical roles such as First Aid, require First Aid explicitly.
  const requiredSkills = role?.requiredSkills || [];
  if (requiredSkills.length > 0) {
    const volunteerSkills = (volunteer.skills || []).map((s) => s.toLowerCase());
    const isFirstAidRole =
      (role.name && role.name.toLowerCase().includes('first aid')) ||
      requiredSkills.some((rs) => rs.toLowerCase().includes('first aid') || rs.toLowerCase().includes('first-aid'));

    if (isFirstAidRole) {
      const hasFirstAid = volunteerSkills.some(
        (s) => s.includes('first aid') || s.includes('first-aid') || s === 'cpr'
      );
      if (!hasFirstAid) {
        return {
          eligible: false,
          reason: 'Role requires explicit First Aid / CPR skill certification',
        };
      }
    } else {
      const matchedCount = volunteerSkills.filter((vs) =>
        requiredSkills.some((rs) => rs.toLowerCase() === vs)
      ).length;

      if (matchedCount === 0) {
        return {
          eligible: false,
          reason: `Volunteer possesses none of the required skills: ${requiredSkills.join(', ')}`,
        };
      }
    }
  }

  return { eligible: true };
};

/**
 * Score eligible candidates transparently (0 to 100 points) and return top 3.
 * Supports optional in-memory volunteersPool and assignmentsPool for zero-database simulation.
 */
export const findCandidateRecommendations = async (
  eventId,
  shiftDoc,
  roleDoc,
  { volunteersPool = null, assignmentsPool = null } = {}
) => {
  // Ensure shift and role are retrieved
  let shift = shiftDoc;
  if (shiftDoc && (!shiftDoc.startTime || !shiftDoc.name)) {
    shift = await Shift.findById(shiftDoc._id || shiftDoc);
  }

  let role = roleDoc;
  if (roleDoc && !roleDoc.requiredSkills) {
    role = await Role.findById(roleDoc._id || roleDoc);
  }

  let allVolunteers;
  if (Array.isArray(volunteersPool)) {
    allVolunteers = volunteersPool.filter(
      (v) => !['dropped', 'dropout', 'no_show'].includes(v.status)
    );
  } else {
    const query = {
      status: { $nin: ['dropped', 'dropout', 'no_show'] },
    };
    if (eventId) {
      query.$or = [
        { eventId },
        { event: eventId },
        { eventId: null, event: null },
        { eventId: '' },
      ];
    }
    allVolunteers = await Volunteer.find(query);
  }

  // Filter against hard constraints
  const eligibleCandidates = [];
  for (const volunteer of allVolunteers) {
    const check = await checkHardConstraints(volunteer, shift, role, eventId, assignmentsPool);
    if (check.eligible) {
      eligibleCandidates.push(volunteer);
    }
  }

  if (eligibleCandidates.length === 0) {
    return [];
  }

  // Workload benchmark
  const maxHours = Math.max(...eligibleCandidates.map((c) => c.totalHours || 0));

  // Retrieve event assignments for continuity
  let eventAssignments;
  if (Array.isArray(assignmentsPool)) {
    const eligibleIds = eligibleCandidates.map((c) => (c.id || c._id).toString());
    eventAssignments = assignmentsPool.filter((a) => {
      const aVolId = (a.volunteer?._id || a.volunteer || a.volunteerId)?.toString();
      return eligibleIds.includes(aVolId) && !INACTIVE_STATUSES.includes(a.status);
    });
  } else {
    eventAssignments = await Assignment.find({
      $or: [
        { event: eventId },
        { eventId },
      ],
      volunteer: { $in: eligibleCandidates.map((c) => c._id) },
      status: { $nin: INACTIVE_STATUSES },
    });
  }

  const scoredRecommendations = eligibleCandidates.map((volunteer) => {
    const reasons = [];

    // A. Skill Match — 0 to 40
    let skillScore = 0;
    const requiredSkills = role?.requiredSkills || [];
    const volunteerSkills = volunteer.skills || [];

    if (requiredSkills.length === 0) {
      skillScore = 40.0;
      reasons.push('General suitability (no specific role skills required)');
    } else {
      const matched = volunteerSkills.filter((vs) =>
        requiredSkills.some((rs) => rs.toLowerCase() === vs.toLowerCase())
      );
      skillScore = Math.round(((matched.length / requiredSkills.length) * 40) * 100) / 100;
      if (matched.length > 0) {
        reasons.push(`Required skill: ${matched.join(', ')}`);
      }
    }

    // B. Availability / Preferred Shift — 0 to 20
    let availabilityScore = 0;
    if (shift) {
      const shiftIdStr = (shift.id || shift._id || shift).toString();
      const hasExplicit = volunteer.availableShiftIds && volunteer.availableShiftIds.length > 0;
      if (hasExplicit && volunteer.availableShiftIds.some((s) => (s?.id || s?._id || s).toString() === shiftIdStr)) {
        availabilityScore = 20.0;
        reasons.push('Available for this shift');
      } else {
        availabilityScore = 10.0;
        reasons.push('Available in general schedule pool');
      }
    }

    // C. Preferred Zone — 0 to 10
    let preferredZoneScore = 0;
    const shiftZoneId = shift?.zone ? (shift.zone._id || shift.zone.id || shift.zone).toString() : null;
    if (shiftZoneId && volunteer.preferredZones && volunteer.preferredZones.length > 0) {
      const matchesZone = volunteer.preferredZones.some(
        (pz) => (pz?._id || pz?.id || pz).toString() === shiftZoneId
      );
      if (matchesZone) {
        preferredZoneScore = 10.0;
        reasons.push('Preferred zone match');
      }
    }

    // D. Workload Fairness — 0 to 20 (fewer assigned hours scores higher)
    let workloadScore = 0;
    const vHours = volunteer.totalHours || 0;
    if (maxHours === 0 || vHours <= 5) {
      workloadScore = 20.0;
      reasons.push('Lower assigned hours');
    } else {
      const raw = 20 * (1 - vHours / (maxHours + 1));
      workloadScore = Math.round(Math.max(0, Math.min(20, raw)) * 100) / 100;
      if (workloadScore >= 12) {
        reasons.push('Balanced workload distribution');
      }
    }

    // E. Zone/Event Continuity — 0 to 10
    let continuityScore = 0;
    const vAssigns = eventAssignments.filter(
      (a) => (a.volunteer?._id || a.volunteer || a.volunteerId)?.toString() === (volunteer._id || volunteer.id).toString()
    );
    if (role && vAssigns.some((a) => (a.role || a.roleId)?.toString() === (role._id || role.id)?.toString())) {
      continuityScore = 10.0;
      reasons.push('Prior experience in this role');
    } else if (vAssigns.length > 0) {
      continuityScore = 5.0;
      reasons.push('Prior experience at this event');
    }

    // Total Score (0 - 100)
    const totalScore = Math.min(
      100,
      Math.round(skillScore + availabilityScore + preferredZoneScore + workloadScore + continuityScore)
    );

    reasons.push('No overlapping assignment');

    return {
      volunteerId: volunteer.id || volunteer._id.toString(),
      name: volunteer.name,
      score: totalScore,
      reasons,
      breakdown: {
        skill: skillScore,
        availability: availabilityScore,
        preferredZone: preferredZoneScore,
        workloadFairness: workloadScore,
        continuity: continuityScore,
      },
    };
  });

  // Deterministic sorting:
  // 1. Highest score descending
  // 2. Fewer total hours ascending
  // 3. Alphabetical name ascending
  scoredRecommendations.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const volA = allVolunteers.find((v) => (v.id || v._id).toString() === a.volunteerId);
    const volB = allVolunteers.find((v) => (v.id || v._id).toString() === b.volunteerId);
    const hoursA = volA?.totalHours || 0;
    const hoursB = volB?.totalHours || 0;
    if (hoursA !== hoursB) {
      return hoursA - hoursB;
    }
    return a.name.localeCompare(b.name);
  });

  return scoredRecommendations.slice(0, 3);
};

export default {
  checkHardConstraints,
  findCandidateRecommendations,
};
