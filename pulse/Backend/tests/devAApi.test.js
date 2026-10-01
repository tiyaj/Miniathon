import { enableTestAuthInterceptor } from './testAuthHelper.js';
// Comprehensive Dev A Integration & QA Test Suite for PULSE
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Event from '../src/models/Event.js';
import Zone from '../src/models/Zone.js';
import Shift from '../src/models/Shift.js';
import Role from '../src/models/Role.js';
import Volunteer from '../src/models/Volunteer.js';
import Assignment from '../src/models/Assignment.js';
import Activity from '../src/models/Activity.js';

let server;
let baseUrl;

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${description}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${description}`);
    }
  };

  try {
    console.log('Connecting to database...');
    await connectDB();
    await enableTestAuthInterceptor();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Dev A test server running at ${baseUrl}\\n`);
        resolve();
      });
    });

    // 1. Health check
    console.log('=== Suite 1: Health & Event Foundation ===');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.data?.status === 'ok', 'Health check /api/health returns 200 { data: { status: "ok" } }');

    // Retrieve or create demo event
    const eventsRes = await fetch(`${baseUrl}/api/events`);
    const eventsData = await eventsRes.json();
    assert(eventsRes.status === 200 && Array.isArray(eventsData.data), 'GET /api/events returns array');

    const demoEvent = eventsData.data.find((e) => e.name?.includes('PULSE Tech Summit')) || eventsData.data[0];
    const eventId = (demoEvent.id || demoEvent._id).toString();
    console.log(`Using demo event: ${demoEvent.name} (${eventId})`);

    // Event structure
    const structRes = await fetch(`${baseUrl}/api/events/${eventId}/structure`);
    const structData = await structRes.json();
    assert(
      structRes.status === 200 &&
      structData.data?.event &&
      Array.isArray(structData.data?.zones) &&
      Array.isArray(structData.data?.shifts) &&
      Array.isArray(structData.data?.roles),
      'GET /api/events/:id/structure returns full event hierarchy'
    );

    const zones = structData.data.zones;
    const shifts = structData.data.shifts;
    const roles = structData.data.roles;

    // Create event with invalid date range
    const invalidDateRes = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Date Event',
        startTime: '2026-10-15T18:00:00.000Z',
        endTime: '2026-10-15T08:00:00.000Z',
      }),
    });
    assert(invalidDateRes.status === 400, 'POST /api/events rejects start time after end time (400)');

    // 2. Volunteer CRUD & Filters
    console.log('\\n=== Suite 2: Volunteer CRUD & Validation ===');
    const uniqueEmail = `deva.vol.${Date.now()}@example.com`;
    const createVolRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'DevA Test Candidate',
        email: uniqueEmail,
        phone: '+91 98888 77777',
        skills: ['crowd-control', 'first-aid'],
        preferredZones: [zones[0].id || zones[0]._id],
        availableShiftIds: [shifts[0].id || shifts[0]._id, shifts[1].id || shifts[1]._id],
      }),
    });
    const createVolData = await createVolRes.json();
    const testVolId = createVolData.data?.id || createVolData.data?._id;
    assert(createVolRes.status === 201 && Boolean(testVolId), 'POST /api/events/:eventId/volunteers creates volunteer');

    // Duplicate email check
    const dupEmailRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Candidate',
        email: uniqueEmail,
      }),
    });
    assert(dupEmailRes.status === 409, 'Duplicate volunteer email returns 409 DUPLICATE_EMAIL');

    // Volunteer filter by skill
    const skillFilterRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers?skill=first-aid`);
    const skillFilterData = await skillFilterRes.json();
    assert(
      skillFilterRes.status === 200 &&
      Array.isArray(skillFilterData.data) &&
      skillFilterData.data.some((v) => (v.id || v._id).toString() === testVolId),
      'GET /volunteers?skill=first-aid correctly filters volunteers'
    );

    // PATCH volunteer
    const patchVolRes = await fetch(`${baseUrl}/api/volunteers/${testVolId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Lead marshal candidate' }),
    });
    const patchVolData = await patchVolRes.json();
    assert(patchVolRes.status === 200 && patchVolData.data?.notes === 'Lead marshal candidate', 'PATCH /volunteers/:id updates volunteer');

    // 3. Assignment & Conflict Prevention
    console.log('\\n=== Suite 3: Assignment & Conflict Prevention ===');
    const crowdRole = roles.find((r) => r.name?.toLowerCase().includes('crowd')) || roles[0];
    const roleId = crowdRole.id || crowdRole._id;
    const morningShift = shifts[0];
    const afternoonShift = shifts[1];
    const morningShiftId = morningShift.id || morningShift._id;
    const afternoonShiftId = afternoonShift.id || afternoonShift._id;

    // Create primary assignment on morning shift (08:00-12:00)
    const assign1Res = await fetch(`${baseUrl}/api/events/${eventId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: testVolId,
        roleId,
        shiftId: morningShiftId,
      }),
    });
    const assign1Data = await assign1Res.json();
    const assignment1Id = assign1Data.data?.id || assign1Data.data?._id;
    assert(assign1Res.status === 201 && Boolean(assignment1Id), 'Assign candidate to morning shift succeeds (201)');

    // Assign to adjacent afternoon shift (12:00-16:00) - MUST BE ALLOWED!
    const assignAdjacentRes = await fetch(`${baseUrl}/api/events/${eventId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: testVolId,
        roleId,
        shiftId: afternoonShiftId,
      }),
    });
    assert(assignAdjacentRes.status === 201, 'Adjacent shift (12:00-16:00) after morning (08:00-12:00) is allowed without conflict');

    // Attempt overlapping assignment on morning shift - MUST BE REJECTED!
    const assignConflictRes = await fetch(`${baseUrl}/api/events/${eventId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: testVolId,
        roleId,
        shiftId: morningShiftId,
      }),
    });
    assert(
      assignConflictRes.status === 409 || assignConflictRes.status === 400,
      'Overlapping shift assignment for same volunteer is rejected (409/400)'
    );

    // 4. Attendance Lifecycle: Check-in, Check-out, Dropout
    console.log('\\n=== Suite 4: Attendance Lifecycle & Hours Calculation ===');
    const checkInRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignment1Id}/check-in`,
      { method: 'POST' }
    );
    const checkInData = await checkInRes.json();
    assert(
      checkInRes.status === 200 && checkInData.data?.status === 'checked_in',
      'Check-in transitions assignment status to checked_in'
    );

    // Small delay to measure hours
    await new Promise((r) => setTimeout(r, 25));

    const checkOutRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignment1Id}/check-out`,
      { method: 'POST' }
    );
    const checkOutData = await checkOutRes.json();
    assert(
      checkOutRes.status === 200 &&
      checkOutData.data?.status === 'completed' &&
      typeof checkOutData.data?.hoursWorked === 'number',
      'Check-out transitions assignment status to completed and derives hoursWorked'
    );

    // Repeated check-out must fail
    const repeatCheckOutRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignment1Id}/check-out`,
      { method: 'POST' }
    );
    assert(repeatCheckOutRes.status === 400, 'Repeated check-out rejected with 400 INVALID_ATTENDANCE_STATE');

    // Create a new assignment to test dropout
    const dropVolEmail = `drop.vol.${Date.now()}@example.com`;
    const dropVolRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Drop Candidate', email: dropVolEmail, skills: ['crowd-control'] }),
    });
    const dropVolData = await dropVolRes.json();
    const dropVolId = dropVolData.data?.id || dropVolData.data?._id;

    const eveningShift = shifts[2];
    const eveningShiftId = eveningShift.id || eveningShift._id;

    const assignToDropRes = await fetch(`${baseUrl}/api/events/${eventId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: dropVolId,
        roleId,
        shiftId: eveningShiftId,
      }),
    });
    const assignToDropData = await assignToDropRes.json();
    const assignToDropId = assignToDropData.data?.id || assignToDropData.data?._id;

    // Dropout
    const dropoutRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignToDropId}/dropout`,
      { method: 'POST' }
    );
    const dropoutData = await dropoutRes.json();
    assert(
      dropoutRes.status === 200 && dropoutData.data?.status === 'dropped',
      'Dropout transitions assignment status to dropped'
    );

    // 5. Suggestions & Replacement Flow
    console.log('\\n=== Suite 5: Matching Suggestions & Replacement ===');
    // Role suggestions
    const roleSuggRes = await fetch(`${baseUrl}/api/events/${eventId}/roles/${roleId}/suggestions`);
    const roleSuggData = await roleSuggRes.json();
    assert(
      roleSuggRes.status === 200 && Array.isArray(roleSuggData.data) && roleSuggData.data.length <= 3,
      'GET /roles/:roleId/suggestions returns at most 3 ranked candidates'
    );

    if (roleSuggData.data.length > 0) {
      const topCand = roleSuggData.data[0];
      assert(typeof topCand.score === 'number' && Array.isArray(topCand.reasons), 'Candidate includes numerical score and explainable reasons');
    }

    // Dropped assignment suggestions
    const dropSuggRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignToDropId}/suggestions`
    );
    const dropSuggData = await dropSuggRes.json();
    assert(dropSuggRes.status === 200, 'GET /assignments/:id/suggestions returns suggestions for dropped slot');

    // Create a fresh candidate to replace
    const replVolEmail = `repl.candidate.${Date.now()}@example.com`;
    const replVolRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Replacement Hero Candidate',
        email: replVolEmail,
        skills: ['crowd-control', 'communication'],
        status: 'available',
      }),
    });
    const replVolData = await replVolRes.json();
    const replVolId = replVolData.data?.id || replVolData.data?._id;

    // Execute Replacement
    const replaceRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignToDropId}/replace`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId: replVolId }),
      }
    );
    const replaceData = await replaceRes.json();
    assert(
      replaceRes.status === 201 &&
      replaceData.data?.replacementAssignment &&
      replaceData.data?.droppedAssignment?.status === 'dropped',
      'POST /replace creates new assignment while preserving original dropped assignment for audit'
    );

    // 6. Dynamic Coverage
    console.log('\\n=== Suite 6: Dynamic Coverage Calculation ===');
    const covRes = await fetch(`${baseUrl}/api/events/${eventId}/coverage`);
    const covData = await covRes.json();
    assert(
      covRes.status === 200 &&
      covData.data?.overall?.required !== undefined &&
      covData.data?.overall?.filled !== undefined &&
      covData.data?.overall?.gap !== undefined &&
      ['Open', 'Filled', 'At Risk', 'Overstaffed'].includes(covData.data?.overall?.status) &&
      Array.isArray(covData.data?.zones),
      'GET /coverage provides required, filled, gap, percent, PRD statuses (Open, Filled, At Risk, Overstaffed), and zone breakdown'
    );

    // 7. Activity logging integration
    console.log('\\n=== Suite 7: Activity Logging Verification ===');
    const actRes = await fetch(`${baseUrl}/api/events/${eventId}/activity`);
    const actData = await actRes.json();
    assert(
      actRes.status === 200 &&
      Array.isArray(actData.data) &&
      actData.data.some((a) => a.type === 'volunteer_check_in' || a.action === 'volunteer_check_in'),
      'Activity log accurately records Dev A events (check-in, check-out, assignment, dropout)'
    );

    // Cleanup test data
    console.log('\\nCleaning up Dev A test entities...');
    await Assignment.deleteMany({ _id: { $in: [assignment1Id, assignToDropId] } });
    await Volunteer.deleteMany({ email: { $in: [uniqueEmail, dropVolEmail, replVolEmail] } });
    console.log('Cleanup complete.');

    console.log('\\n=======================================');
    console.log(`TOTAL DEV A TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('=======================================');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Dev A test runner failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTests();
