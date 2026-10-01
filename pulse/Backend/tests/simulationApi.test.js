import { enableTestAuthInterceptor } from './testAuthHelper.js';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';
import Event from '../src/models/Event.js';
import Zone from '../src/models/Zone.js';
import Shift from '../src/models/Shift.js';
import Role from '../src/models/Role.js';
import Volunteer from '../src/models/Volunteer.js';
import Assignment from '../src/models/Assignment.js';

let server;
let baseUrl;

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const method = options.method || 'GET';
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? body : undefined,
  });

  const status = response.status;
  let json = null;
  const text = await response.text();
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { rawText: text };
  }
  return { status, body: json };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    failedCount++;
    console.error(`\x1b[31m  [FAIL] ${message}\x1b[0m`);
    throw new Error(message);
  }
  passedCount++;
  console.log(`\x1b[32m  [PASS] ${message}\x1b[0m`);
}

async function runSimulationTests() {
  console.log('\n=== Starting PULSE What-If Event Simulator Test Suite ===');
  await connectDB();
    await enableTestAuthInterceptor();

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Simulation test server running at ${baseUrl}`);
      resolve();
    });
  });

  const testId = `sim_${Date.now()}`;
  const createdIds = {
    events: [],
    zones: [],
    shifts: [],
    roles: [],
    volunteers: [],
    assignments: [],
  };

  try {
    // ----------------------------------------------------
    // Setup Test Environment: Event with 2 Zones, 2 Shifts, 3 Roles, 4 Volunteers, 3 Assignments
    // ----------------------------------------------------
    console.log('\n--- Setup Test Event & Operational Structure ---');

    const simEvent = await Event.create({
      name: `Simulation Arena Summit ${testId}`,
      venue: 'Main Arena',
      startTime: new Date('2026-11-20T08:00:00Z'),
      endTime: new Date('2026-11-20T20:00:00Z'),
    });
    createdIds.events.push(simEvent._id);
    const eventId = simEvent._id.toString();

    // Zone 1: Entry Gate
    const zoneEntry = await Zone.create({
      event: simEvent._id,
      eventId,
      name: 'Entry Gate',
      capacity: 5,
    });
    createdIds.zones.push(zoneEntry._id);

    // Zone 2: Medical Tent
    const zoneMed = await Zone.create({
      event: simEvent._id,
      eventId,
      name: 'Medical Tent',
      capacity: 5,
    });
    createdIds.zones.push(zoneMed._id);

    // Shift 1: Morning (08:00 - 12:00)
    const shiftMorning = await Shift.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      name: 'Morning Shift',
      startTime: new Date('2026-11-20T08:00:00Z'),
      endTime: new Date('2026-11-20T12:00:00Z'),
    });
    createdIds.shifts.push(shiftMorning._id);

    // Shift 2: Afternoon (12:00 - 16:00)
    const shiftAfternoon = await Shift.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      name: 'Afternoon Shift',
      startTime: new Date('2026-11-20T12:00:00Z'),
      endTime: new Date('2026-11-20T16:00:00Z'),
    });
    createdIds.shifts.push(shiftAfternoon._id);

    // Role 1: Crowd Marshal in Entry (Morning)
    const roleMarshal = await Role.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      shift: shiftMorning._id,
      name: 'Crowd Marshal',
      requiredSkills: ['Crowd Control'],
      capacity: 1,
      requiredCount: 1,
      priority: 'Medium',
    });
    createdIds.roles.push(roleMarshal._id);

    // Role 2: Ticket Scanner in Entry (Morning)
    const roleScanner = await Role.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      shift: shiftMorning._id,
      name: 'Ticket Scanner',
      requiredSkills: ['Customer Service'],
      capacity: 1,
      requiredCount: 1,
      priority: 'Low',
    });
    createdIds.roles.push(roleScanner._id);

    // Role 3: First Aid Lead in Medical Tent (Morning)
    const roleMedic = await Role.create({
      event: simEvent._id,
      eventId,
      zone: zoneMed._id,
      shift: shiftMorning._id,
      name: 'First Aid Medic',
      requiredSkills: ['First Aid'],
      capacity: 1,
      requiredCount: 1,
      priority: 'High',
    });
    createdIds.roles.push(roleMedic._id);

    // Volunteer 1: Alice (Marshal)
    const volAlice = await Volunteer.create({
      eventId,
      name: 'Alice Marshal',
      email: `alice_${testId}@test.com`,
      skills: ['Crowd Control', 'Customer Service'],
      availableShiftIds: [shiftMorning._id.toString(), shiftAfternoon._id.toString()],
      status: 'assigned',
      totalHours: 4,
    });
    createdIds.volunteers.push(volAlice._id);

    // Volunteer 2: Bob (Scanner)
    const volBob = await Volunteer.create({
      eventId,
      name: 'Bob Scanner',
      email: `bob_${testId}@test.com`,
      skills: ['Customer Service'],
      availableShiftIds: [shiftMorning._id.toString()],
      status: 'assigned',
      totalHours: 2,
    });
    createdIds.volunteers.push(volBob._id);

    // Volunteer 3: Charlie (First Aid Lead)
    const volCharlie = await Volunteer.create({
      eventId,
      name: 'Charlie Medic',
      email: `charlie_${testId}@test.com`,
      skills: ['First Aid'],
      availableShiftIds: [shiftMorning._id.toString()],
      status: 'assigned',
      totalHours: 8,
    });
    createdIds.volunteers.push(volCharlie._id);

    // Volunteer 4: Dave (Multi-skilled Backup, available)
    const volDave = await Volunteer.create({
      eventId,
      name: 'Dave MultiBackup',
      email: `dave_${testId}@test.com`,
      skills: ['Crowd Control', 'Customer Service', 'First Aid'],
      availableShiftIds: [shiftMorning._id.toString()],
      status: 'available',
      totalHours: 0,
    });
    createdIds.volunteers.push(volDave._id);

    // Assignments
    const assignAlice = await Assignment.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      shift: shiftMorning._id,
      role: roleMarshal._id,
      volunteer: volAlice._id,
      status: 'assigned',
    });
    createdIds.assignments.push(assignAlice._id);

    const assignBob = await Assignment.create({
      event: simEvent._id,
      eventId,
      zone: zoneEntry._id,
      shift: shiftMorning._id,
      role: roleScanner._id,
      volunteer: volBob._id,
      status: 'assigned',
    });
    createdIds.assignments.push(assignBob._id);

    const assignCharlie = await Assignment.create({
      event: simEvent._id,
      eventId,
      zone: zoneMed._id,
      shift: shiftMorning._id,
      role: roleMedic._id,
      volunteer: volCharlie._id,
      status: 'assigned',
    });
    createdIds.assignments.push(assignCharlie._id);

    console.log('Setup complete: 3 active assignments, 1 backup volunteer.');

    // Snapshot database state before running simulations
    const preAssignmentsCount = await Assignment.countDocuments({ event: simEvent._id });
    const preVolAlice = await Volunteer.findById(volAlice._id);
    const preAssignAlice = await Assignment.findById(assignAlice._id);

    // ----------------------------------------------------
    // Test 1: Single Volunteer Dropout Simulation
    // ----------------------------------------------------
    console.log('\n--- Test 1: Single Volunteer Dropout ---');
    const sim1 = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString()] },
    });
    assert(sim1.status === 200, 'Test 1: Single volunteer simulation returns 200');
    assert(sim1.body.data.simulatedDropouts.length === 1, 'Test 1: Identifies 1 simulated dropout');
    assert(sim1.body.data.simulatedDropouts[0].volunteerId === volAlice._id.toString(), 'Test 1: Correct volunteer ID reported');

    // ----------------------------------------------------
    // Test 2 & 3: Multiple Volunteer Dropouts & Coverage Decrease
    // ----------------------------------------------------
    console.log('\n--- Test 2 & 3: Multiple Dropouts & Coverage Dynamics ---');
    const sim2 = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString(), volBob._id.toString()] },
    });
    assert(sim2.status === 200, 'Test 2: Multiple dropouts simulation returns 200');
    assert(sim2.body.data.simulatedDropouts.length === 2, 'Test 2: Identifies 2 simulated dropouts');

    const cov = sim2.body.data.coverage;
    assert(cov.current.assigned === 3, 'Test 3a: Current assigned count is 3');
    assert(cov.projected.assigned === 1, 'Test 3b: Projected assigned drops to 1');
    assert(cov.change.additionalVacancies === 2, 'Test 3c: Additional vacancies is 2');
    assert(cov.change.coveragePercent < 0, `Test 3d: Coverage percent decreased (${cov.change.coveragePercent}%)`);

    // ----------------------------------------------------
    // Test 4 & 5: Affected Areas Identification
    // ----------------------------------------------------
    console.log('\n--- Test 4 & 5: Affected Areas Identification ---');
    const affected = sim2.body.data.affectedAreas;
    assert(Array.isArray(affected) && affected.length === 1, 'Test 4: Exactly 1 affected area identified');
    assert(affected[0].zoneName === 'Entry Gate', 'Test 5a: Affected zone is Entry Gate');
    assert(affected[0].additionalVacancies === 2, 'Test 5b: Reports 2 additional vacancies in Entry Gate');
    assert(affected[0].projectedCoveragePercent < affected[0].currentCoveragePercent, 'Test 5c: Projected zone coverage < current');

    // ----------------------------------------------------
    // Test 6 & 7: Replacement Candidates & Score Explainability
    // ----------------------------------------------------
    console.log('\n--- Test 6 & 7: Replacement Candidates & Explainability ---');
    const replOptions = sim2.body.data.replacementOptions;
    assert(Array.isArray(replOptions) && replOptions.length === 2, 'Test 6a: 2 replacement options generated for the 2 affected slots');

    const marshalRepl = replOptions.find((r) => r.roleName === 'Crowd Marshal');
    assert(marshalRepl !== undefined, 'Test 6b: Replacement option found for Crowd Marshal slot');
    assert(marshalRepl.candidates.length > 0, 'Test 6c: Candidates found for Crowd Marshal slot');

    const candDave = marshalRepl.candidates.find((c) => c.volunteerId === volDave._id.toString());
    assert(candDave !== undefined, 'Test 7a: Dave identified as qualified replacement candidate');
    assert(typeof candDave.score === 'number' && candDave.score > 0, `Test 7b: Candidate score is numerical (${candDave.score})`);
    assert(Array.isArray(candDave.reasons) && candDave.reasons.length > 0, 'Test 7c: Candidate has human-readable reasons');

    // ----------------------------------------------------
    // Test 8 & 9: Multi-Vacancy Conflict-Aware Recovery Projection
    // ----------------------------------------------------
    console.log('\n--- Test 8 & 9: Conflict-Aware Recovery Projection ---');
    // Both Alice (Marshal) and Bob (Scanner) dropped out in Morning shift.
    // Dave is the ONLY available replacement, but both slots are in Morning shift!
    // Dave CANNOT be double-booked across both slots simultaneously!
    // Thus: 1 slot is replaceable (by Dave), but the 2nd slot is unrecoverable!
    const recovery = sim2.body.data.recovery;
    assert(recovery.affectedAssignments === 2, 'Test 8a: Total affected assignments is 2');
    assert(recovery.replaceableAssignments === 1, 'Test 8b: Exactly 1 slot is replaceable due to single backup');
    assert(recovery.unrecoverableAssignments === 1, 'Test 8c: Exactly 1 slot is unrecoverable (prevents double-booking same backup)');
    assert(recovery.remainingVacancies === 1, 'Test 8d: Remaining vacancies accurately reported');

    // ----------------------------------------------------
    // Test 10 & 11: Resilience Integration & Baseline Preservation
    // ----------------------------------------------------
    console.log('\n--- Test 10 & 11: Resilience Integration & Change Tracking ---');
    const resil = sim2.body.data.resilience;
    assert(resil.current.score !== undefined && resil.projected.score !== undefined, 'Test 10a: Current and projected resilience scores present');
    assert(resil.projected.riskScore > resil.current.riskScore, 'Test 10b: Projected risk score increases with dropouts');
    assert(resil.change < 0, `Test 10c: Resilience change is negative (${resil.change} pts)`);

    // ----------------------------------------------------
    // Test 12, 13, 14: DATABASE IMMUTABILITY VERIFICATION (CRITICAL)
    // ----------------------------------------------------
    console.log('\n--- Test 12, 13, 14: Strict Database Immutability Check ---');
    const postAssignmentsCount = await Assignment.countDocuments({ event: simEvent._id });
    const postVolAlice = await Volunteer.findById(volAlice._id);
    const postAssignAlice = await Assignment.findById(assignAlice._id);

    assert(postAssignmentsCount === preAssignmentsCount, 'Test 12: Total MongoDB assignment count is unchanged (zero new assignments)');
    assert(postVolAlice.status === 'assigned', 'Test 13: Simulated volunteer status in MongoDB is completely unchanged (still assigned)');
    assert(postAssignAlice.status === 'assigned', 'Test 14: Simulated assignment status in MongoDB is completely unchanged (still assigned)');

    // ----------------------------------------------------
    // Test 15: Determinism Verification
    // ----------------------------------------------------
    console.log('\n--- Test 15: Determinism Verification ---');
    const repeatA = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString()] },
    });
    const repeatB = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString()] },
    });
    assert(
      JSON.stringify(repeatA.body.data) === JSON.stringify(repeatB.body.data),
      'Test 15: Identical simulation request produces 100% deterministic results across repeat invocations'
    );

    // ----------------------------------------------------
    // Test 16, 17, 18, 19, 20: Validation & Error Handling
    // ----------------------------------------------------
    console.log('\n--- Test 16 to 20: Validation & Error Handling ---');

    // 16: Invalid volunteer ID format
    const errInvalidId = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [''] },
    });
    assert(errInvalidId.status === 400 && errInvalidId.body?.error?.code === 'INVALID_VOLUNTEER_ID', 'Test 16: Empty string volunteer ID rejected with 400');

    // 17: Volunteer from another event
    const foreignEvt = await Event.create({ name: 'Foreign Event', venue: 'Hall X' });
    createdIds.events.push(foreignEvt._id);
    const foreignVol = await Volunteer.create({ eventId: foreignEvt._id.toString(), name: 'Foreign Vol', email: `for_${testId}@test.com` });
    createdIds.volunteers.push(foreignVol._id);

    const errForeign = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [foreignVol._id.toString()] },
    });
    assert(errForeign.status === 400 && errForeign.body?.error?.code === 'VOLUNTEER_EVENT_MISMATCH', 'Test 17: Foreign volunteer rejected with 400 VOLUNTEER_EVENT_MISMATCH');

    // 18: Unknown volunteer ID
    const errUnknownVol = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: ['65f000000000000000000000'] },
    });
    assert(errUnknownVol.status === 404 && errUnknownVol.body?.error?.code === 'VOLUNTEER_NOT_FOUND', 'Test 18: Unknown volunteer rejected with 404 VOLUNTEER_NOT_FOUND');

    // 19: Unknown event ID
    const errUnknownEvt = await request('/api/events/65f000000000000000000000/simulate', {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString()] },
    });
    assert(errUnknownEvt.status === 404 && errUnknownEvt.body?.error?.code === 'EVENT_NOT_FOUND', 'Test 19: Unknown event returns 404 EVENT_NOT_FOUND');

    // 20: Empty dropout list
    const errEmpty = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [] },
    });
    assert(errEmpty.status === 400 && errEmpty.body?.error?.code === 'VALIDATION_ERROR', 'Test 20: Empty dropoutVolunteerIds array rejected with 400');

    // 21: Duplicate volunteer IDs are safely deduplicated
    const dupRes = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: [volAlice._id.toString(), volAlice._id.toString()] },
    });
    assert(dupRes.status === 200 && dupRes.body.data.simulatedDropouts.length === 1, 'Test 21: Duplicate volunteer IDs are safely deduplicated');

    console.log('\n\x1b[32m=== ALL SIMULATION TESTS COMPLETED SUCCESSFULLY ===\x1b[0m');
  } finally {
    console.log('Cleaning up simulation test data...');
    await Assignment.deleteMany({ _id: { $in: createdIds.assignments } });
    await Role.deleteMany({ _id: { $in: createdIds.roles } });
    await Shift.deleteMany({ _id: { $in: createdIds.shifts } });
    await Zone.deleteMany({ _id: { $in: createdIds.zones } });
    await Volunteer.deleteMany({ _id: { $in: createdIds.volunteers } });
    await Event.deleteMany({ _id: { $in: createdIds.events } });
    console.log('Cleanup complete.');

    if (server) server.close();
    await mongoose.connection.close();
  }

  console.log(`\n=======================================`);
  console.log(`TOTAL SIMULATION TESTS: ${passedCount + failedCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log(`=======================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSimulationTests().catch((err) => {
  console.error('\n\x1b[31mSIMULATION TEST CRASHED:\x1b[0m', err);
  if (server) server.close();
  mongoose.connection.close();
  process.exit(1);
});
