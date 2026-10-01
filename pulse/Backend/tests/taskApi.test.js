import { enableTestAuthInterceptor } from './testAuthHelper.js';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Task from '../src/models/Task.js';

let server;
let baseUrl;

const runTests = async () => {
  let passed = 0;
  let failed = 0;
  const testResults = [];

  const assert = (condition, description) => {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${description}`);
      testResults.push({ description, status: 'PASS' });
    } else {
      failed++;
      console.error(`  [FAIL] ${description}`);
      testResults.push({ description, status: 'FAIL' });
    }
  };

  try {
    console.log('Connecting to database...');
    await connectDB();
    await enableTestAuthInterceptor();

    // Start server on an ephemeral port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    const testEventId = `test-evt-${Date.now()}`;
    let taskId1 = null;
    let taskId2 = null;
    let taskId3 = null;

    console.log('=== Integration Checks ===');

    // Integration Check 1 & 5: Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.data?.status === 'ok',
      'Integration 5: Existing unrelated route /api/health works correctly'
    );

    console.log('\n=== Failure Cases ===');

    // Failure Case 1: Create a task without a title
    const fc1Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-entry',
        priority: 'High',
      }),
    });
    const fc1Data = await fc1Res.json();
    assert(
      fc1Res.status === 400 && fc1Data.error?.code === 'VALIDATION_ERROR',
      'Failure 1: Reject task creation without title (400 VALIDATION_ERROR)'
    );

    // Failure Case 2: Create a task with an invalid priority
    const fc2Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Queue check',
        zoneId: 'zone-entry',
        priority: 'Urgent',
      }),
    });
    const fc2Data = await fc2Res.json();
    assert(
      fc2Res.status === 400 && fc2Data.error?.code === 'INVALID_PRIORITY',
      'Failure 2: Reject task creation with invalid priority (400 INVALID_PRIORITY)'
    );

    // Failure Case 3: Create a task with an invalid status
    const fc3Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Queue check',
        zoneId: 'zone-entry',
        status: 'Closed',
      }),
    });
    const fc3Data = await fc3Res.json();
    assert(
      fc3Res.status === 400 && fc3Data.error?.code === 'INVALID_STATUS',
      'Failure 3: Reject task creation with invalid status (400 INVALID_STATUS)'
    );

    // Failure Case 7: Invalid zone reference (zone belonging to different event)
    const existingZone = await mongoose.connection.db.collection('zones').findOne();
    const wrongEventId = 'different-event-999';
    const fc7Res = await fetch(`${baseUrl}/api/events/${wrongEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Gate monitoring',
        zoneId: existingZone ? existingZone._id.toString() : 'invalid-zone-id',
      }),
    });
    const fc7Data = await fc7Res.json();
    assert(
      fc7Res.status === 400 && (fc7Data.error?.code === 'INVALID_ZONE' || fc7Data.error?.code === 'ZONE_NOT_FOUND'),
      'Failure 7: Reject task with zone belonging to another event (400 INVALID_ZONE / ZONE_NOT_FOUND)'
    );

    console.log('\n=== Successful Cases ===');

    // Successful Case 1: Create a task with valid data
    const sc1Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-entry',
        title: 'Manage entry queue',
        description: 'Guide attendees through the entry lanes.',
        priority: 'High',
        assigneeVolunteerId: 'vol-12',
      }),
    });
    const sc1Data = await sc1Res.json();
    taskId1 = sc1Data.data?.id || sc1Data.data?._id;
    assert(
      sc1Res.status === 201 &&
        sc1Data.data?.title === 'Manage entry queue' &&
        sc1Data.data?.priority === 'High' &&
        sc1Data.data?.status === 'Open' &&
        sc1Data.data?.assigneeVolunteerId === 'vol-12' &&
        Boolean(sc1Data.data?.createdAt),
      'Success 1: Create task with valid data, default status Open, and timestamps (201 Created)'
    );

    // Create 2 more tasks for filtering tests
    const sc1bRes = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-stage',
        title: 'Stage lighting setup',
        description: 'Verify lighting fixtures',
        priority: 'Low',
        status: 'Open',
      }),
    });
    const sc1bData = await sc1bRes.json();
    taskId2 = sc1bData.data?.id || sc1bData.data?._id;

    const sc1cRes = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: 'zone-entry',
        title: 'Sanitize gate entrance',
        priority: 'Medium',
        status: 'Resolved',
      }),
    });
    const sc1cData = await sc1cRes.json();
    taskId3 = sc1cData.data?.id || sc1cData.data?._id;

    // Successful Case 2: Retrieve tasks for the correct event
    const sc2Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`);
    const sc2Data = await sc2Res.json();
    assert(
      sc2Res.status === 200 &&
        Array.isArray(sc2Data.data) &&
        sc2Data.data.length === 3 &&
        sc2Data.data.every((t) => t.eventId === testEventId),
      'Success 2: Retrieve tasks belonging only to the specified event (200 OK)'
    );

    // Empty event retrieval
    const emptyRes = await fetch(`${baseUrl}/api/events/empty-${Date.now()}/tasks`);
    const emptyData = await emptyRes.json();
    assert(
      emptyRes.status === 200 &&
        Array.isArray(emptyData.data) &&
        emptyData.data.length === 0,
      'Success 2b: Return empty array gracefully when event has no tasks (200 OK)'
    );

    // Successful Case 3: Retrieve tasks filtered by zone
    const sc3Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks?zoneId=zone-entry`);
    const sc3Data = await sc3Res.json();
    assert(
      sc3Res.status === 200 &&
        sc3Data.data.length === 2 &&
        sc3Data.data.every((t) => t.zoneId === 'zone-entry'),
      'Success 3: Retrieve tasks filtered by zoneId (200 OK)'
    );

    // Successful Case 4: Retrieve tasks filtered by status
    const sc4Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks?status=Open`);
    const sc4Data = await sc4Res.json();
    assert(
      sc4Res.status === 200 &&
        sc4Data.data.length === 2 &&
        sc4Data.data.every((t) => t.status === 'Open'),
      'Success 4: Retrieve tasks filtered by status (200 OK)'
    );

    // Successful Case 5: Retrieve tasks filtered by priority
    const sc5Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks?priority=High`);
    const sc5Data = await sc5Res.json();
    assert(
      sc5Res.status === 200 &&
        sc5Data.data.length === 1 &&
        sc5Data.data[0].priority === 'High',
      'Success 5: Retrieve tasks filtered by priority (200 OK)'
    );

    console.log('\n=== Update and Lifecycle Cases ===');

    // Failure Case 6: Submit an empty update payload
    const fc6Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const fc6Data = await fc6Res.json();
    assert(
      fc6Res.status === 400 && fc6Data.error?.code === 'EMPTY_PAYLOAD',
      'Failure 6: Reject empty update payload (400 EMPTY_PAYLOAD)'
    );

    // Failure Case 4: Update a task using a nonexistent task ID
    const fc4Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/tasks/000000000000000000000000`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Title' }),
      }
    );
    const fc4Data = await fc4Res.json();
    assert(
      fc4Res.status === 404 && fc4Data.error?.code === 'TASK_NOT_FOUND',
      'Failure 4: Return 404 for nonexistent task ID'
    );

    // Failure Case 5: Attempt to access a task through the wrong event ID
    const fc5Res = await fetch(
      `${baseUrl}/api/events/different-event-id/tasks/${taskId1}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Title' }),
      }
    );
    const fc5Data = await fc5Res.json();
    assert(
      fc5Res.status === 404 && fc5Data.error?.code === 'TASK_NOT_FOUND',
      'Failure 5: Return 404 when accessing task through wrong event ID'
    );

    // Successful Case 6: Update a task's title and description
    const sc6Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Manage main entry queue',
        description: 'Prioritize attendees with valid pre-registration badges.',
      }),
    });
    const sc6Data = await sc6Res.json();
    assert(
      sc6Res.status === 200 &&
        sc6Data.data?.title === 'Manage main entry queue' &&
        sc6Data.data?.description ===
          'Prioritize attendees with valid pre-registration badges.',
      'Success 6: Update task title and description (200 OK)'
    );

    // Successful Case 7: Change task status from Open to In Progress
    const sc7Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Progress' }),
    });
    const sc7Data = await sc7Res.json();
    assert(
      sc7Res.status === 200 && sc7Data.data?.status === 'In Progress',
      'Success 7: Move task status from Open to In Progress (200 OK)'
    );

    // Successful Case 8: Change task status to Resolved
    const sc8Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    const sc8Data = await sc8Res.json();
    assert(
      sc8Res.status === 200 && sc8Data.data?.status === 'Resolved',
      'Success 8: Move task status to Resolved (200 OK)'
    );

    // Successful Case 9: Assign or change volunteer assignee
    const sc9Res = await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeVolunteerId: 'vol-34' }),
    });
    const sc9Data = await sc9Res.json();
    assert(
      sc9Res.status === 200 && sc9Data.data?.assigneeVolunteerId === 'vol-34',
      'Success 9: Update task assignee volunteer ID (200 OK)'
    );

    console.log('\n=== Persistence Check ===');

    // Integration Check 4: Data persistence directly in MongoDB
    const persistedTask = await Task.findById(taskId1);
    assert(
      persistedTask &&
        persistedTask.status === 'Resolved' &&
        persistedTask.assigneeVolunteerId === 'vol-34',
      'Integration 4: Task updates persisted accurately in MongoDB storage'
    );

    // Cleanup test data
    console.log('\nCleaning up test tasks...');
    await Task.deleteMany({ eventId: testEventId });
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
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
  }
};

runTests();
