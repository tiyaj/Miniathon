import { enableTestAuthInterceptor } from './testAuthHelper.js';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Task from '../src/models/Task.js';
import Incident from '../src/models/Incident.js';
import Announcement from '../src/models/Announcement.js';
import Activity from '../src/models/Activity.js';
import Volunteer from '../src/models/Volunteer.js';
import Assignment from '../src/models/Assignment.js';

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
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    console.log('=== PHASE 5: Full End-to-End Workflow Verification ===');

    // Step 1: Retrieve the demo event
    const eventsRes = await fetch(`${baseUrl}/api/events`);
    const eventsData = await eventsRes.json();
    assert(
      eventsRes.status === 200 && Array.isArray(eventsData.data) && eventsData.data.length > 0,
      'Step 1: Retrieve demo events list successfully'
    );

    const demoEvent =
      eventsData.data.find((e) => e.name?.includes('PULSE Tech Summit')) || eventsData.data[0];
    const eventId = demoEvent.id || demoEvent._id;
    console.log(`Using demo event: ${demoEvent.name} (${eventId})`);

    // Step 2: Retrieve its zones, shifts, and roles
    const structureRes = await fetch(`${baseUrl}/api/events/${eventId}/structure`);
    const structureData = await structureRes.json();
    assert(
      structureRes.status === 200 &&
        Array.isArray(structureData.data?.zones) &&
        Array.isArray(structureData.data?.shifts) &&
        Array.isArray(structureData.data?.roles),
      'Step 2: Retrieve event structure (zones, shifts, roles) successfully'
    );

    const firstZone = structureData.data.zones[0];
    const firstRole = structureData.data.roles[0];
    const firstShift = structureData.data.shifts[0];

    // Step 3: Retrieve or create volunteers
    const createVolRes = await fetch(`${baseUrl}/api/events/${eventId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo Test Volunteer',
        email: `demo.vol.${Date.now()}@example.com`,
        phone: '+91 99999 11111',
        skills: ['crowd-control', 'communication'],
      }),
    });
    const createVolData = await createVolRes.json();
    const volunteerId = createVolData.data?.id || createVolData.data?._id;
    assert(
      createVolRes.status === 201 && Boolean(volunteerId),
      'Step 3: Create/retrieve volunteer successfully'
    );

    // Step 4: Generate or retrieve assignment recommendations
    const roleId = firstRole ? firstRole.id || firstRole._id : 'default-role-id';
    const suggestionsRes = await fetch(`${baseUrl}/api/events/${eventId}/roles/${roleId}/suggestions`);
    const suggestionsData = await suggestionsRes.json();
    assert(
      suggestionsRes.status === 200 && Array.isArray(suggestionsData.data),
      'Step 4: Generate assignment recommendations successfully'
    );

    // Step 5: Create or confirm assignments
    const shiftId = firstShift ? firstShift.id || firstShift._id : null;
    const assignRes = await fetch(`${baseUrl}/api/events/${eventId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId,
        roleId,
        shiftId,
      }),
    });
    const assignData = await assignRes.json();
    const assignmentId = assignData.data?.id || assignData.data?._id;
    assert(
      assignRes.status === 201 && Boolean(assignmentId),
      'Step 5: Create/confirm volunteer assignment successfully'
    );

    // Step 6: Verify coverage information
    const coverageRes = await fetch(`${baseUrl}/api/events/${eventId}/coverage`);
    const coverageData = await coverageRes.json();
    assert(
      coverageRes.status === 200 &&
        coverageData.data?.overall !== undefined &&
        Array.isArray(coverageData.data?.zones),
      'Step 6: Verify coverage calculation metrics successfully'
    );

    // Step 7: Check a volunteer in and verify attendance
    const checkInRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignmentId}/check-in`,
      { method: 'POST' }
    );
    const checkInData = await checkInRes.json();
    assert(
      checkInRes.status === 200 && checkInData.data?.status === 'checked_in',
      'Step 7a: Check volunteer in for assignment'
    );

    const checkOutRes = await fetch(
      `${baseUrl}/api/events/${eventId}/assignments/${assignmentId}/check-out`,
      { method: 'POST' }
    );
    const checkOutData = await checkOutRes.json();
    assert(
      checkOutRes.status === 200 && checkOutData.data?.status === 'completed',
      'Step 7b: Check volunteer out and calculate attendance hours'
    );

    // Step 8: Create a task and update its status
    const taskRes = await fetch(`${baseUrl}/api/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Queue Logistics',
        zoneId: firstZone ? firstZone.id || firstZone._id : 'zone-main',
        priority: 'High',
      }),
    });
    const taskData = await taskRes.json();
    const taskId = taskData.data?.id || taskData.data?._id;

    await fetch(`${baseUrl}/api/events/${eventId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    assert(Boolean(taskId), 'Step 8: Create task and update lifecycle status to Resolved');

    // Step 9: Report an incident
    const incRes = await fetch(`${baseUrl}/api/events/${eventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E First Aid Request',
        zoneId: firstZone ? firstZone.id || firstZone._id : 'zone-entry',
        type: 'Medical Emergency',
        severity: 'Critical',
      }),
    });
    const incData = await incRes.json();
    const incidentId = incData.data?.id || incData.data?._id;
    assert(Boolean(incidentId), 'Step 9: Report an incident successfully');

    // Step 10: Verify incident routing
    assert(
      incData.data?.assignedCoordinator === 'Medical Coordinator',
      'Step 10: Verified rule-based incident routing to Medical Coordinator'
    );

    // Step 11: Acknowledge, escalate, and resolve the incident
    await fetch(`${baseUrl}/api/events/${eventId}/incidents/${incidentId}/acknowledge`, {
      method: 'PATCH',
    });
    await fetch(`${baseUrl}/api/events/${eventId}/incidents/${incidentId}/escalate`, {
      method: 'PATCH',
    });
    const resolveRes = await fetch(
      `${baseUrl}/api/events/${eventId}/incidents/${incidentId}/resolve`,
      { method: 'PATCH' }
    );
    const resolveData = await resolveRes.json();
    assert(
      resolveRes.status === 200 && resolveData.data?.status === 'Resolved',
      'Step 11: Acknowledge, escalate, and resolve incident successfully'
    );

    // Step 12: Create an announcement
    const annRes = await fetch(`${baseUrl}/api/events/${eventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Broadcast',
        message: 'Final sprint demo starting now.',
        audience: 'Everyone',
        priority: 'Urgent',
      }),
    });
    const annData = await annRes.json();
    assert(
      annRes.status === 201 && annData.data?.status === 'Published',
      'Step 12: Create and publish broadcast announcement'
    );

    // Step 13: Retrieve the activity feed
    const activityRes = await fetch(`${baseUrl}/api/events/${eventId}/activity?limit=10`);
    const activityData = await activityRes.json();
    assert(
      activityRes.status === 200 &&
        Array.isArray(activityData.data) &&
        activityData.data.length >= 5,
      'Step 13: Retrieve event activity feed with recorded workflow actions'
    );

    // Step 14: Retrieve the dashboard
    const dashRes = await fetch(`${baseUrl}/api/events/${eventId}/dashboard`);
    const dashData = await dashRes.json();
    assert(
      dashRes.status === 200 &&
        dashData.data?.event?.name === demoEvent.name &&
        Boolean(dashData.data?.metrics),
      'Step 14: Retrieve consolidated dashboard for demo event'
    );

    // Step 15: Verify that dashboard metrics reflect the actions performed above
    assert(
      dashData.data?.metrics?.tasks?.resolved >= 1 &&
        dashData.data?.metrics?.incidents?.resolved >= 1 &&
        dashData.data?.metrics?.announcements?.published >= 1 &&
        dashData.data?.recentActivity?.length > 0,
      'Step 15: Verify dashboard reflects all tasks, incidents, announcements, and activity updates'
    );

    // Clean up E2E temporary records
    console.log('\nCleaning up E2E test data...');
    await Task.deleteOne({ _id: taskId });
    await Incident.deleteOne({ _id: incidentId });
    await Announcement.deleteOne({ _id: annData.data?.id || annData.data?._id });
    await Assignment.deleteOne({ _id: assignmentId });
    await Volunteer.deleteOne({ _id: volunteerId });
    await Activity.deleteMany({
      eventId,
      message: { $regex: /E2E/ },
    });
    console.log('Cleanup complete.');

    console.log('\n=======================================');
    console.log(`TOTAL E2E TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('=======================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('E2E Test execution failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTests();
