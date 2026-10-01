import { enableTestAuthInterceptor } from './testAuthHelper.js';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Incident from '../src/models/Incident.js';
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
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    const testEventId = `test-inc-evt-${Date.now()}`;
    let incidentId1 = null;

    console.log('=== Integration Checks ===');

    // Integration check: Health endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.data?.status === 'ok',
      'Integration: Health check endpoint /api/health works'
    );

    // Integration check: Existing task management routes still work
    const taskRes = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`);
    const taskData = await taskRes.json();
    assert(
      taskRes.status === 200 && Array.isArray(taskData.data),
      'Integration: Part 1 task routes still work flawlessly'
    );

    console.log('\n=== Routing Service Checks ===');

    // Test 2: Medical incident routes to Medical Coordinator
    const medRes = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Visitor fainting near stage',
        zoneId: 'zone-general',
        type: 'Medical Emergency',
        severity: 'High',
      }),
    });
    const medData = await medRes.json();
    assert(
      medRes.status === 201 && medData.data?.assignedCoordinator === 'Medical Coordinator',
      'Routing 2: Medical incident routes to Medical Coordinator'
    );

    // Test 3: Incident in Entry Gate routes to Operations/Zone Coordinator
    const entryRes = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Crowd barrier breach',
        zoneId: 'zone-entry-gate',
        type: 'Crowd Control',
        severity: 'Critical',
      }),
    });
    const entryData = await entryRes.json();
    assert(
      entryRes.status === 201 &&
        entryData.data?.assignedCoordinator === 'Operations/Zone Coordinator',
      'Routing 3: Incident in Entry Gate routes to Operations/Zone Coordinator'
    );

    // Test 4: Incident with no identifiable coordinator falls back to Event Lead
    const fallbackRes = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Lost badge reported',
        zoneId: 'zone-info-desk',
        type: 'Inquiry',
        severity: 'Low',
      }),
    });
    const fallbackData = await fallbackRes.json();
    assert(
      fallbackRes.status === 201 && fallbackData.data?.assignedCoordinator === 'Event Lead',
      'Routing 4: Incident with unknown context falls back to Event Lead'
    );

    console.log('\n=== Failure Scenarios ===');

    // Failure 1: Creating an incident without a title is rejected
    const f1Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-entry',
        severity: 'High',
      }),
    });
    const f1Data = await f1Res.json();
    assert(
      f1Res.status === 400 && f1Data.error?.code === 'VALIDATION_ERROR',
      'Failure 1: Reject incident creation without title (400 VALIDATION_ERROR)'
    );

    // Failure 2: Invalid severity is rejected
    const f2Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Power outage',
        zoneId: 'zone-entry',
        severity: 'SuperCritical',
      }),
    });
    const f2Data = await f2Res.json();
    assert(
      f2Res.status === 400 && f2Data.error?.code === 'INVALID_SEVERITY',
      'Failure 2: Reject incident creation with invalid severity (400 INVALID_SEVERITY)'
    );

    // Failure 3: Invalid status filter is rejected
    const f3Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents?status=InvalidStatus`);
    const f3Data = await f3Res.json();
    assert(
      f3Res.status === 400 && f3Data.error?.code === 'INVALID_FILTER',
      'Failure 3: Reject invalid status query filter (400 INVALID_FILTER)'
    );

    // Failure 6: Nonexistent or mismatched zone is rejected
    const existingZone = await mongoose.connection.db.collection('zones').findOne();
    const wrongEventId = 'different-event-888';
    const f6Res = await fetch(`${baseUrl}/api/events/${wrongEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Water leak',
        zoneId: existingZone ? existingZone._id.toString() : 'invalid-zone',
      }),
    });
    const f6Data = await f6Res.json();
    assert(
      f6Res.status === 400 &&
        (f6Data.error?.code === 'INVALID_ZONE' || f6Data.error?.code === 'ZONE_NOT_FOUND'),
      'Failure 6: Reject incident with zone belonging to another event (400 INVALID_ZONE / ZONE_NOT_FOUND)'
    );

    // Failure 8: Malformed request payload returns controlled error
    const f8Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-payload',
    });
    const f8Data = await f8Res.json();
    assert(
      f8Res.status === 400 && f8Data.error?.code === 'INVALID_JSON',
      'Failure 8: Malformed JSON payload returns controlled error without stack trace'
    );

    console.log('\n=== Successful Scenarios & Lifecycle ===');

    // Test 1: A valid incident can be reported
    const s1Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-entry',
        type: 'Crowd Surge',
        title: 'Crowd building near entry',
        description: 'Attendees are gathering near the east entry lane.',
        severity: 'Critical',
      }),
    });
    const s1Data = await s1Res.json();
    incidentId1 = s1Data.data?.id || s1Data.data?._id;
    assert(
      s1Res.status === 201 &&
        s1Data.data?.title === 'Crowd building near entry' &&
        s1Data.data?.status === 'Open' &&
        s1Data.data?.severity === 'Critical' &&
        s1Data.data?.assignedCoordinator === 'Operations/Zone Coordinator',
      'Success 1: Report a valid incident with default status Open (201 Created)'
    );

    // Test 5: Incidents can be retrieved for the correct event
    const s5Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`);
    const s5Data = await s5Res.json();
    assert(
      s5Res.status === 200 &&
        Array.isArray(s5Data.data) &&
        s5Data.data.length === 4 &&
        s5Data.data.every((inc) => inc.eventId === testEventId),
      'Success 5: Retrieve incidents belonging only to the specified event'
    );

    // Test 6: Filtering by zone works
    const s6Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents?zoneId=zone-entry`);
    const s6Data = await s6Res.json();
    assert(
      s6Res.status === 200 &&
        s6Data.data.length === 1 &&
        s6Data.data[0].zoneId === 'zone-entry',
      'Success 6: Filtering incidents by zone works'
    );

    // Test 7: Filtering by status works
    const s7Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents?status=Open`);
    const s7Data = await s7Res.json();
    assert(
      s7Res.status === 200 &&
        s7Data.data.length === 4 &&
        s7Data.data.every((inc) => inc.status === 'Open'),
      'Success 7: Filtering incidents by status works'
    );

    // Test 8: Filtering by severity works
    const s8Res = await fetch(`${baseUrl}/api/events/${testEventId}/incidents?severity=Critical`);
    const s8Data = await s8Res.json();
    assert(
      s8Res.status === 200 &&
        s8Data.data.length === 2 &&
        s8Data.data.every((inc) => inc.severity === 'Critical'),
      'Success 8: Filtering incidents by severity works'
    );

    // Failure 4: Nonexistent incident ID returns 404
    const f4Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/000000000000000000000000/acknowledge`,
      { method: 'PATCH' }
    );
    const f4Data = await f4Res.json();
    assert(
      f4Res.status === 404 && f4Data.error?.code === 'INCIDENT_NOT_FOUND',
      'Failure 4: Nonexistent incident ID returns 404 not-found'
    );

    // Failure 5: Incident cannot be accessed through the wrong event ID
    const f5Res = await fetch(
      `${baseUrl}/api/events/wrong-event-id/incidents/${incidentId1}/acknowledge`,
      { method: 'PATCH' }
    );
    const f5Data = await f5Res.json();
    assert(
      f5Res.status === 404 && f5Data.error?.code === 'INCIDENT_NOT_FOUND',
      'Failure 5: Incident cannot be accessed through wrong event ID (404)'
    );

    // Test 9: An incident can be acknowledged and receives acknowledgedAt
    const s9Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/${incidentId1}/acknowledge`,
      { method: 'PATCH' }
    );
    const s9Data = await s9Res.json();
    assert(
      s9Res.status === 200 &&
        s9Data.data?.status === 'Acknowledged' &&
        Boolean(s9Data.data?.acknowledgedAt),
      'Success 9: Acknowledge incident and record acknowledgedAt timestamp (200 OK)'
    );

    // Test 10: An incident can be escalated and receives escalatedAt
    const s10Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/${incidentId1}/escalate`,
      { method: 'PATCH' }
    );
    const s10Data = await s10Res.json();
    assert(
      s10Res.status === 200 &&
        s10Data.data?.status === 'Escalated' &&
        Boolean(s10Data.data?.escalatedAt) &&
        s10Data.data?.title === 'Crowd building near entry',
      'Success 10: Escalate incident, preserve report details, and record escalatedAt timestamp (200 OK)'
    );

    // Test 11: An incident can be resolved and receives resolvedAt
    const s11Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/${incidentId1}/resolve`,
      { method: 'PATCH' }
    );
    const s11Data = await s11Res.json();
    assert(
      s11Res.status === 200 &&
        s11Data.data?.status === 'Resolved' &&
        Boolean(s11Data.data?.resolvedAt),
      'Success 11: Resolve incident and record resolvedAt timestamp (200 OK)'
    );

    // Failure 7: A resolved incident cannot be acknowledged or escalated again
    const f7AckRes = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/${incidentId1}/acknowledge`,
      { method: 'PATCH' }
    );
    const f7AckData = await f7AckRes.json();

    const f7EscRes = await fetch(
      `${baseUrl}/api/events/${testEventId}/incidents/${incidentId1}/escalate`,
      { method: 'PATCH' }
    );
    const f7EscData = await f7EscRes.json();

    assert(
      f7AckRes.status === 400 &&
        f7AckData.error?.code === 'INVALID_STATE_TRANSITION' &&
        f7EscRes.status === 400 &&
        f7EscData.error?.code === 'INVALID_STATE_TRANSITION',
      'Failure 7: A resolved incident cannot be acknowledged or escalated again (400 INVALID_STATE_TRANSITION)'
    );

    // Test 12: Incident actions create activity entries in history
    const activities = await Activity.find({ eventId: testEventId }).sort({ createdAt: 1 });
    const activityTypes = activities.map((a) => a.type);
    assert(
      activities.length >= 4 &&
        activityTypes.includes('incident_reported') &&
        activityTypes.includes('incident_acknowledged') &&
        activityTypes.includes('incident_escalated') &&
        activityTypes.includes('incident_resolved'),
      'Success 12: Incident lifecycle actions recorded accurately in Activity collection'
    );

    console.log('\nCleaning up test data...');
    await Incident.deleteMany({ eventId: testEventId });
    await Activity.deleteMany({ eventId: testEventId });
    console.log('Cleanup complete.');

    console.log('\n=======================================');
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('=======================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTests();
