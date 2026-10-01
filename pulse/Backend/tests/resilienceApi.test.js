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

async function runResilienceTests() {
  console.log('\n=== Starting PULSE Resilience / Risk Engine Test Suite ===');
  await connectDB();
    await enableTestAuthInterceptor();

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Resilience test server running at ${baseUrl}`);
      resolve();
    });
  });

  const testId = `resil_${Date.now()}`;
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
    // Test 1: Event with Full Coverage
    // ----------------------------------------------------
    console.log('\n--- Scenario 1: Event with Full Coverage ---');
    const fullEvt = await Event.create({
      name: `Full Coverage Summit ${testId}`,
      venue: 'Arena 1',
      startTime: new Date('2026-11-01T08:00:00Z'),
      endTime: new Date('2026-11-01T16:00:00Z'),
    });
    createdIds.events.push(fullEvt._id);

    const fullZone = await Zone.create({
      event: fullEvt._id,
      eventId: fullEvt._id.toString(),
      name: 'Safe Zone',
      capacity: 10,
    });
    createdIds.zones.push(fullZone._id);

    const fullShift = await Shift.create({
      event: fullEvt._id,
      eventId: fullEvt._id.toString(),
      zone: fullZone._id,
      name: 'All-Day Shift',
      startTime: new Date('2026-11-01T08:00:00Z'),
      endTime: new Date('2026-11-01T16:00:00Z'),
    });
    createdIds.shifts.push(fullShift._id);

    const fullRole = await Role.create({
      event: fullEvt._id,
      eventId: fullEvt._id.toString(),
      zone: fullZone._id,
      shift: fullShift._id,
      name: 'General Greeter',
      capacity: 1,
      requiredCount: 1,
    });
    createdIds.roles.push(fullRole._id);

    const fullVol = await Volunteer.create({
      eventId: fullEvt._id.toString(),
      name: 'Active Greeter',
      email: `greeter_${testId}@test.com`,
      availableShiftIds: [fullShift._id.toString()],
      status: 'available',
      totalHours: 2,
    });
    createdIds.volunteers.push(fullVol._id);

    const backupVol = await Volunteer.create({
      eventId: fullEvt._id.toString(),
      name: 'Backup Greeter',
      email: `backup_${testId}@test.com`,
      availableShiftIds: [fullShift._id.toString()],
      status: 'available',
      totalHours: 0,
    });
    createdIds.volunteers.push(backupVol._id);

    const fullAssign = await Assignment.create({
      event: fullEvt._id,
      eventId: fullEvt._id.toString(),
      zone: fullZone._id,
      shift: fullShift._id,
      role: fullRole._id,
      volunteer: fullVol._id,
      status: 'assigned',
    });
    createdIds.assignments.push(fullAssign._id);

    const res1 = await request(`/api/events/${fullEvt._id}/resilience`);
    assert(res1.status === 200, 'Test 1: Full coverage event returns 200');
    assert(res1.body.data.overallScore >= 80, `Test 1: Full coverage overallScore is high (${res1.body.data.overallScore})`);
    assert(res1.body.data.riskLevel === 'low', 'Test 1: Full coverage riskLevel is low');
    assert(res1.body.data.summary.totalVacancies === 0, 'Test 1: Zero vacancies reported');

    // ----------------------------------------------------
    // Test 2: Event with Vacancies
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Event with Vacancies ---');
    const vacEvt = await Event.create({
      name: `Vacant Summit ${testId}`,
      venue: 'Arena 2',
      startTime: new Date('2026-11-02T08:00:00Z'),
      endTime: new Date('2026-11-02T16:00:00Z'),
    });
    createdIds.events.push(vacEvt._id);

    const vacZone = await Zone.create({
      event: vacEvt._id,
      eventId: vacEvt._id.toString(),
      name: 'Unfilled Zone',
      capacity: 5,
    });
    createdIds.zones.push(vacZone._id);

    const vacShift = await Shift.create({
      event: vacEvt._id,
      eventId: vacEvt._id.toString(),
      zone: vacZone._id,
      name: 'Vacant Shift',
      startTime: new Date('2026-11-02T08:00:00Z'),
      endTime: new Date('2026-11-02T16:00:00Z'),
    });
    createdIds.shifts.push(vacShift._id);

    const vacRole = await Role.create({
      event: vacEvt._id,
      eventId: vacEvt._id.toString(),
      zone: vacZone._id,
      shift: vacShift._id,
      name: 'Security Officer',
      capacity: 3,
      requiredCount: 3,
    });
    createdIds.roles.push(vacRole._id);

    const res2 = await request(`/api/events/${vacEvt._id}/resilience`);
    assert(res2.status === 200, 'Test 2: Event with vacancies returns 200');
    assert(res2.body.data.summary.totalVacancies === 3, 'Test 2: Accurately counts 3 vacancies');
    assert(res2.body.data.areas[0].coveragePercent === 0, 'Test 2: Coverage percent is 0%');
    assert(res2.body.data.areas[0].reasons.some((r) => r.includes('coverage deficit') || r.includes('unfilled')), 'Test 2: Reasons explain coverage deficit');

    // ----------------------------------------------------
    // Test 3: Event with Dropped Volunteers
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Event with Dropped Volunteers ---');
    const droppedAssign = await Assignment.create({
      event: vacEvt._id,
      eventId: vacEvt._id.toString(),
      zone: vacZone._id,
      shift: vacShift._id,
      role: vacRole._id,
      volunteer: fullVol._id,
      status: 'dropped',
    });
    createdIds.assignments.push(droppedAssign._id);

    const res3 = await request(`/api/events/${vacEvt._id}/resilience`);
    assert(res3.status === 200, 'Test 3: Event with dropped volunteer returns 200');
    assert(res3.body.data.areas[0].breakdown.dropoutScore > 0, 'Test 3: Dropout score is incremented');
    assert(res3.body.data.areas[0].reasons.some((r) => r.includes('dropout')), 'Test 3: Reasons mention prior volunteer dropout');

    // ----------------------------------------------------
    // Test 4: Event with Zero Eligible Replacements
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Event with Zero Eligible Replacements ---');
    const zeroReplEvt = await Event.create({
      name: `Specialist Event ${testId}`,
      venue: 'Arena 4',
      startTime: new Date('2026-11-04T08:00:00Z'),
      endTime: new Date('2026-11-04T16:00:00Z'),
    });
    createdIds.events.push(zeroReplEvt._id);

    const zeroZone = await Zone.create({
      event: zeroReplEvt._id,
      eventId: zeroReplEvt._id.toString(),
      name: 'Hazard Zone',
      capacity: 5,
    });
    createdIds.zones.push(zeroZone._id);

    const zeroShift = await Shift.create({
      event: zeroReplEvt._id,
      eventId: zeroReplEvt._id.toString(),
      zone: zeroZone._id,
      name: 'Specialist Shift',
      startTime: new Date('2026-11-04T08:00:00Z'),
      endTime: new Date('2026-11-04T16:00:00Z'),
    });
    createdIds.shifts.push(zeroShift._id);

    const specialistRole = await Role.create({
      event: zeroReplEvt._id,
      eventId: zeroReplEvt._id.toString(),
      zone: zeroZone._id,
      shift: zeroShift._id,
      name: 'Hazmat Coordinator',
      requiredSkills: ['Hazmat Level 5'], // No volunteers possess this skill
      capacity: 1,
      requiredCount: 1,
      priority: 'High',
    });
    createdIds.roles.push(specialistRole._id);

    const res4 = await request(`/api/events/${zeroReplEvt._id}/resilience`);
    assert(res4.status === 200, 'Test 4: Zero eligible replacements returns 200');
    assert(res4.body.data.areas[0].eligibleReplacements === 0, 'Test 4: Eligible replacements is 0');
    assert(res4.body.data.areas[0].breakdown.bufferScore === 30, 'Test 4: Maximum buffer penalty (30 pts) applied for 0 backups');
    assert(res4.body.data.areas[0].reasons.some((r) => r.includes('Zero eligible replacement')), 'Test 4: Reasons flag zero eligible replacement volunteers');

    // ----------------------------------------------------
    // Test 5: Event with Many Eligible Replacements
    // ----------------------------------------------------
    console.log('\n--- Scenario 5: Event with Many Eligible Replacements ---');
    // Add 4 general volunteers for this event
    for (let i = 1; i <= 4; i++) {
      const gVol = await Volunteer.create({
        eventId: zeroReplEvt._id.toString(),
        name: `General Volunteer ${i} ${testId}`,
        email: `gen_${i}_${testId}@test.com`,
        skills: ['General Support'],
        availableShiftIds: [zeroShift._id.toString()],
        status: 'available',
      });
      createdIds.volunteers.push(gVol._id);
    }

    const generalRole = await Role.create({
      event: zeroReplEvt._id,
      eventId: zeroReplEvt._id.toString(),
      zone: zeroZone._id,
      shift: zeroShift._id,
      name: 'Badge Scanner',
      requiredSkills: ['General Support'],
      capacity: 1,
      requiredCount: 1,
    });
    createdIds.roles.push(generalRole._id);

    const res5 = await request(`/api/events/${zeroReplEvt._id}/resilience`);
    assert(res5.status === 200, 'Test 5: Many eligible replacements returns 200');
    assert(res5.body.data.areas[0].eligibleReplacements >= 4, `Test 5: Zone replacement pool is deep (${res5.body.data.areas[0].eligibleReplacements} backups)`);

    // ----------------------------------------------------
    // Test 6: High Workload Situation
    // ----------------------------------------------------
    console.log('\n--- Scenario 6: High Workload / Volunteer Fatigue ---');
    const tiredVol = await Volunteer.create({
      eventId: fullEvt._id.toString(),
      name: 'Overworked Volunteer',
      email: `tired_${testId}@test.com`,
      availableShiftIds: [fullShift._id.toString()],
      status: 'assigned',
      totalHours: 22, // > 15 hours fatigue threshold
    });
    createdIds.volunteers.push(tiredVol._id);

    const tiredAssign = await Assignment.create({
      event: fullEvt._id,
      eventId: fullEvt._id.toString(),
      zone: fullZone._id,
      shift: fullShift._id,
      role: fullRole._id,
      volunteer: tiredVol._id,
      status: 'assigned',
    });
    createdIds.assignments.push(tiredAssign._id);

    const res6 = await request(`/api/events/${fullEvt._id}/resilience`);
    assert(res6.status === 200, 'Test 6: High workload returns 200');
    assert(res6.body.data.areas[0].breakdown.workloadScore > 0, 'Test 6: Workload score is triggered');
    assert(res6.body.data.areas[0].reasons.some((r) => r.includes('workload') || r.includes('fatigue')), 'Test 6: Reasons explain volunteer fatigue risk');

    // ----------------------------------------------------
    // Test 7: Multiple Zones with Different Risk Levels
    // ----------------------------------------------------
    console.log('\n--- Scenario 7: Multiple Zones with Different Risk Levels ---');
    const multiEvt = await Event.create({
      name: `Multi Zone Summit ${testId}`,
      venue: 'Complex 1',
      startTime: new Date('2026-11-10T08:00:00Z'),
      endTime: new Date('2026-11-10T20:00:00Z'),
    });
    createdIds.events.push(multiEvt._id);

    // Zone 1: High Risk (Unfilled + Zero replacements + Critical role + Dropouts)
    const zHigh = await Zone.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), name: 'High Risk Zone' });
    createdIds.zones.push(zHigh._id);
    const sHigh = await Shift.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zHigh._id, name: 'Shift High', startTime: new Date('2026-11-10T08:00:00Z'), endTime: new Date('2026-11-10T14:00:00Z') });
    createdIds.shifts.push(sHigh._id);
    const rHigh = await Role.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zHigh._id, shift: sHigh._id, name: 'First Aid Emergency Lead', requiredSkills: ['Rare Triage Cert'], capacity: 2, requiredCount: 2, priority: 'High' });
    createdIds.roles.push(rHigh._id);
    const dHigh = await Assignment.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zHigh._id, shift: sHigh._id, role: rHigh._id, volunteer: fullVol._id, status: 'dropped' });
    createdIds.assignments.push(dHigh._id);

    // Zone 2: Low Risk (Fully staffed with 100% coverage)
    const zLow = await Zone.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), name: 'Low Risk Zone' });
    createdIds.zones.push(zLow._id);
    const sLow = await Shift.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zLow._id, name: 'Shift Low', startTime: new Date('2026-11-10T08:00:00Z'), endTime: new Date('2026-11-10T14:00:00Z') });
    createdIds.shifts.push(sLow._id);
    const rLow = await Role.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zLow._id, shift: sLow._id, name: 'Info Desk', capacity: 1, requiredCount: 1 });
    createdIds.roles.push(rLow._id);
    const vLow = await Volunteer.create({ eventId: multiEvt._id.toString(), name: 'Info Guy', email: `info_${testId}@test.com`, availableShiftIds: [sLow._id.toString()], status: 'available' });
    createdIds.volunteers.push(vLow._id);
    const aLow = await Assignment.create({ event: multiEvt._id, eventId: multiEvt._id.toString(), zone: zLow._id, shift: sLow._id, role: rLow._id, volunteer: vLow._id, status: 'assigned' });
    createdIds.assignments.push(aLow._id);

    const res7 = await request(`/api/events/${multiEvt._id}/resilience`);
    assert(res7.status === 200, 'Test 7: Multi-zone event returns 200');
    assert(res7.body.data.summary.highRiskAreas >= 1, `Test 7: High risk area identified (${res7.body.data.summary.highRiskAreas})`);
    assert(res7.body.data.summary.lowRiskAreas >= 1, `Test 7: Low risk area identified (${res7.body.data.summary.lowRiskAreas})`);
    assert(res7.body.data.vulnerableAreas.length > 0, 'Test 7: Vulnerable areas list populated');
    assert(res7.body.data.vulnerableAreas[0].zoneName === 'High Risk Zone', 'Test 7: High Risk Zone ranked top of vulnerable areas');

    // ----------------------------------------------------
    // Test 8: Invalid Event ID
    // ----------------------------------------------------
    console.log('\n--- Scenario 8: Invalid Event ID ---');
    const res8 = await request('/api/events/   /resilience');
    assert(res8.status === 400 || res8.status === 404, `Test 8: Invalid event ID returns error (${res8.status})`);

    // ----------------------------------------------------
    // Test 9: Unknown Event
    // ----------------------------------------------------
    console.log('\n--- Scenario 9: Unknown Event ID ---');
    const res9 = await request('/api/events/65f000000000000000000000/resilience');
    assert(res9.status === 404 && res9.body?.error?.code === 'EVENT_NOT_FOUND', 'Test 9: Unknown event returns 404 EVENT_NOT_FOUND');

    // ----------------------------------------------------
    // Test 10: Determinism Verification
    // ----------------------------------------------------
    console.log('\n--- Scenario 10: Determinism Verification ---');
    const callA = await request(`/api/events/${multiEvt._id}/resilience`);
    const callB = await request(`/api/events/${multiEvt._id}/resilience`);
    const callC = await request(`/api/events/${multiEvt._id}/resilience`);

    assert(
      JSON.stringify(callA.body.data) === JSON.stringify(callB.body.data) &&
      JSON.stringify(callB.body.data) === JSON.stringify(callC.body.data),
      'Test 10: Resilience scoring, breakdown, and reasons are strictly deterministic across repeated invocations'
    );

        // ----------------------------------------------------
    // Scenario 11: CRITICAL BUG REGRESSION: 7% Coverage with Large Replacement Pool
    // ----------------------------------------------------
    console.log('\n--- Scenario 11: Critical Regression (7% Coverage + Large Replacement Pool) ---');
    const severeEvt = await Event.create({
      name: `Severe Undercoverage ${testId}`,
      venue: 'Arena Critical',
      startTime: new Date('2026-11-10T08:00:00Z'),
      endTime: new Date('2026-11-10T20:00:00Z'),
    });
    createdIds.events.push(severeEvt._id);

    const severeZone = await Zone.create({
      event: severeEvt._id,
      eventId: severeEvt._id.toString(),
      name: 'Crisis Zone',
      capacity: 100,
    });
    createdIds.zones.push(severeZone._id);

    const severeShift = await Shift.create({
      event: severeEvt._id,
      eventId: severeEvt._id.toString(),
      zone: severeZone._id,
      name: 'All Day Shift',
      startTime: new Date('2026-11-10T08:00:00Z'),
      endTime: new Date('2026-11-10T20:00:00Z'),
    });
    createdIds.shifts.push(severeShift._id);

    // Requires 28 volunteers
    const severeRole = await Role.create({
      event: severeEvt._id,
      eventId: severeEvt._id.toString(),
      zone: severeZone._id,
      shift: severeShift._id,
      name: 'Event Marshal',
      capacity: 28,
      requiredCount: 28,
      requiredSkills: ['Crowd Support'],
    });
    createdIds.roles.push(severeRole._id);

    // Only 2 assigned volunteers (7% coverage!)
    for (let i = 1; i <= 2; i++) {
      const assignedVol = await Volunteer.create({
        eventId: severeEvt._id.toString(),
        name: `Assigned Vol ${i} ${testId}`,
        email: `assign_${i}_${testId}@test.com`,
        skills: ['Crowd Support'],
        availableShiftIds: [severeShift._id.toString()],
        status: 'assigned',
      });
      createdIds.volunteers.push(assignedVol._id);

      const aDoc = await Assignment.create({
        event: severeEvt._id,
        eventId: severeEvt._id.toString(),
        zone: severeZone._id,
        shift: severeShift._id,
        role: severeRole._id,
        volunteer: assignedVol._id,
        status: 'assigned',
      });
      createdIds.assignments.push(aDoc._id);
    }

    // Large pool of 10 available replacement volunteers
    for (let i = 1; i <= 10; i++) {
      const backupVol = await Volunteer.create({
        eventId: severeEvt._id.toString(),
        name: `Backup Vol ${i} ${testId}`,
        email: `backup_pool_${i}_${testId}@test.com`,
        skills: ['Crowd Support'],
        availableShiftIds: [severeShift._id.toString()],
        status: 'available',
      });
      createdIds.volunteers.push(backupVol._id);
    }

    const res11 = await request(`/api/events/${severeEvt._id}/resilience`);
    assert(res11.status === 200, 'Test 11a: 7% coverage request returns 200');
    assert(res11.body.data.riskLevel === 'high', `Test 11b: 7% coverage is classified as HIGH RISK (got: ${res11.body.data.riskLevel})`);
    assert(res11.body.data.riskScore >= 65, `Test 11c: 7% coverage riskScore is at least 65 (got: ${res11.body.data.riskScore})`);
    assert(res11.body.data.resilienceScore <= 35, `Test 11d: 7% coverage resilienceScore is severely reduced (got: ${res11.body.data.resilienceScore})`);
    assert(
      res11.body.data.areas[0].reasons.some((r) => r.includes('Critical coverage deficit') || r.includes('7%')),
      'Test 11e: Reasons explicitly flag the critical 7% coverage deficit'
    );
    assert(
      res11.body.data.areas[0].reasons.some((r) => r.includes('Recovery capability') || r.includes('replacement')),
      'Test 11f: Replacement capacity is still reflected positively as recovery capability'
    );

    // ----------------------------------------------------
    // Scenario 12: Event-Level Staffing-Weighted Aggregation
    // ----------------------------------------------------
    console.log('\n--- Scenario 12: Event-Level Staffing-Weighted Aggregation ---');
    const weightEvt = await Event.create({
      name: `Weighted Aggregation ${testId}`,
      venue: 'Arena Weighted',
      startTime: new Date('2026-11-12T08:00:00Z'),
      endTime: new Date('2026-11-12T20:00:00Z'),
    });
    createdIds.events.push(weightEvt._id);

    // Major Zone requiring 20 volunteers, 0 assigned
    const majorZone = await Zone.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      name: 'Major Zone (20 req)',
      capacity: 50,
    });
    createdIds.zones.push(majorZone._id);

    const majorShift = await Shift.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      zone: majorZone._id,
      name: 'Major Shift',
      startTime: new Date('2026-11-12T08:00:00Z'),
      endTime: new Date('2026-11-12T20:00:00Z'),
    });
    createdIds.shifts.push(majorShift._id);

    const majorRole = await Role.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      zone: majorZone._id,
      shift: majorShift._id,
      name: 'Major Role',
      capacity: 20,
      requiredCount: 20,
    });
    createdIds.roles.push(majorRole._id);

    // Minor Zone requiring 1 volunteer, 1 assigned (100% coverage)
    const minorZone = await Zone.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      name: 'Minor Zone (1 req)',
      capacity: 5,
    });
    createdIds.zones.push(minorZone._id);

    const minorShift = await Shift.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      zone: minorZone._id,
      name: 'Minor Shift',
      startTime: new Date('2026-11-12T08:00:00Z'),
      endTime: new Date('2026-11-12T20:00:00Z'),
    });
    createdIds.shifts.push(minorShift._id);

    const minorRole = await Role.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      zone: minorZone._id,
      shift: minorShift._id,
      name: 'Minor Role',
      capacity: 1,
      requiredCount: 1,
    });
    createdIds.roles.push(minorRole._id);

    const minorVol = await Volunteer.create({
      eventId: weightEvt._id.toString(),
      name: `Minor Vol ${testId}`,
      email: `minor_${testId}@test.com`,
      availableShiftIds: [minorShift._id.toString()],
      status: 'assigned',
    });
    createdIds.volunteers.push(minorVol._id);

    const minorAssign = await Assignment.create({
      event: weightEvt._id,
      eventId: weightEvt._id.toString(),
      zone: minorZone._id,
      shift: minorShift._id,
      role: minorRole._id,
      volunteer: minorVol._id,
      status: 'assigned',
    });
    createdIds.assignments.push(minorAssign._id);

    const res12 = await request(`/api/events/${weightEvt._id}/resilience`);
    assert(res12.status === 200, 'Test 12a: Weighted event returns 200');
    assert(res12.body.data.riskLevel === 'high', `Test 12b: Overall event is HIGH RISK despite 1 tiny zone being 100% covered (got: ${res12.body.data.riskLevel})`);
    assert(res12.body.data.riskScore >= 65, `Test 12c: Weighted aggregation preserves high risk of dominant major zone (${res12.body.data.riskScore})`);


    console.log('\n\x1b[32m=== ALL RESILIENCE TESTS COMPLETED SUCCESSFULLY ===\x1b[0m');
  } finally {
    console.log('Cleaning up resilience test data...');
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
  console.log(`TOTAL RESILIENCE TESTS: ${passedCount + failedCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log(`=======================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runResilienceTests().catch((err) => {
  console.error('\n\x1b[31mTEST SUITE CRASHED:\x1b[0m', err);
  if (server) server.close();
  mongoose.connection.close();
  process.exit(1);
});
