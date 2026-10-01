import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Task from '../src/models/Task.js';
import Incident from '../src/models/Incident.js';
import Announcement from '../src/models/Announcement.js';
import Activity from '../src/models/Activity.js';
import Event from '../src/models/Event.js';

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

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    const testEventId = `dash-test-evt-${Date.now()}`;
    const nonExistentEventId = `nonexistent-evt-${Date.now()}`;

    // Create an Event document for the test event
    await Event.create({
      _id: new mongoose.Types.ObjectId(),
      name: 'Hackathon Grand Summit',
      venue: 'Main Campus Hall',
      status: 'active',
      startTime: new Date('2026-11-01T09:00:00.000Z'),
      endTime: new Date('2026-11-01T21:00:00.000Z'),
    }).then(async (ev) => {
      // Also insert with string _id matching testEventId for explicit test
      await mongoose.connection.db.collection('events').insertOne({
        _id: testEventId,
        name: 'Hackathon Grand Summit',
        venue: 'Main Campus Hall',
        status: 'active',
        startTime: new Date('2026-11-01T09:00:00.000Z'),
        endTime: new Date('2026-11-01T21:00:00.000Z'),
      });
    });

    console.log('=== Dashboard Retrieval & Error Scenarios ===');

    // Dashboard Test 11: Nonexistent event returns 404
    const nonExistentRes = await fetch(`${baseUrl}/api/events/${nonExistentEventId}/dashboard`);
    const nonExistentData = await nonExistentRes.json();
    assert(
      nonExistentRes.status === 404 && nonExistentData.error?.code === 'EVENT_NOT_FOUND',
      'Dashboard 11: Nonexistent event returns 404 EVENT_NOT_FOUND'
    );

    // Dashboard Test 1 & 10: Empty collections produce valid zero counts and empty arrays
    const initialDashRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const initialDashData = await initialDashRes.json();
    assert(
      initialDashRes.status === 200 &&
        initialDashData.data?.event?.name === 'Hackathon Grand Summit' &&
        initialDashData.data?.metrics?.tasks?.total === 0 &&
        initialDashData.data?.metrics?.incidents?.total === 0 &&
        initialDashData.data?.metrics?.announcements?.total === 0 &&
        Array.isArray(initialDashData.data?.recentActivity) &&
        initialDashData.data?.recentActivity.length === 0,
      'Dashboard 1 & 10: Valid event with initial empty metrics returns 200 with zero counts and empty arrays'
    );

    // Dashboard Test 2: Dashboard returns correct event information
    assert(
      initialDashData.data?.event?.venue === 'Main Campus Hall' &&
        initialDashData.data?.event?.status === 'active' &&
        Boolean(initialDashData.data?.event?.startTime),
      'Dashboard 2: Event overview metadata populated accurately'
    );

    console.log('\n=== Multi-Module Aggregation & Integration Checks ===');

    // Integration Step 1: Create a task and verify metrics update
    const taskRes = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Inspect Emergency Exits',
        zoneId: 'zone-exit',
        priority: 'High',
      }),
    });
    const taskData = await taskRes.json();
    const createdTaskId = taskData.data?.id || taskData.data?._id;

    const afterTaskDashRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const afterTaskDashData = await afterTaskDashRes.json();
    assert(
      afterTaskDashData.data?.metrics?.tasks?.total === 1 &&
        afterTaskDashData.data?.metrics?.tasks?.open === 1 &&
        afterTaskDashData.data?.tasks?.open === 1,
      'Integration 1 & Dashboard 4: Task creation immediately reflects in dashboard task metrics'
    );

    // Integration Step 2: Update task status to In Progress, then Resolved
    await fetch(`${baseUrl}/api/events/${testEventId}/tasks/${createdTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });

    const afterTaskUpdateRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const afterTaskUpdateData = await afterTaskUpdateRes.json();
    assert(
      afterTaskUpdateData.data?.metrics?.tasks?.open === 0 &&
        afterTaskUpdateData.data?.metrics?.tasks?.resolved === 1 &&
        afterTaskUpdateData.data?.tasks?.completed === 1,
      'Integration 2: Updating task status to Resolved updates completed/resolved task count'
    );

    // Integration Step 3: Report an incident and check incident metrics
    const incRes = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Overheated generator',
        zoneId: 'zone-generator',
        type: 'Electrical',
        severity: 'Critical',
      }),
    });
    const incData = await incRes.json();
    const createdIncId = incData.data?.id || incData.data?._id;

    const afterIncDashRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const afterIncDashData = await afterIncDashRes.json();
    assert(
      afterIncDashData.data?.metrics?.incidents?.total === 1 &&
        afterIncDashData.data?.metrics?.incidents?.open === 1 &&
        afterIncDashData.data?.metrics?.incidents?.critical === 1 &&
        afterIncDashData.data?.criticalIncidents === 1,
      'Integration 3 & Dashboard 5: Reporting incident updates incident metrics and critical count'
    );

    // Acknowledge incident
    await fetch(`${baseUrl}/api/events/${testEventId}/incidents/${createdIncId}/acknowledge`, {
      method: 'PATCH',
    });

    const afterAckDashRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const afterAckDashData = await afterAckDashRes.json();
    assert(
      afterAckDashData.data?.metrics?.incidents?.acknowledged === 1 &&
        afterAckDashData.data?.metrics?.incidents?.open === 0,
      'Integration 3b: Acknowledging incident updates status breakdown'
    );

    // Integration Step 4: Create an Announcement and check announcement metrics
    await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Lunch Area Ready',
        message: 'Lunch buffet is now open at Hall B.',
        audience: 'Everyone',
        priority: 'Urgent',
      }),
    });

    const afterAnnDashRes = await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const afterAnnDashData = await afterAnnDashRes.json();
    assert(
      afterAnnDashData.data?.metrics?.announcements?.total === 1 &&
        afterAnnDashData.data?.metrics?.announcements?.published === 1 &&
        afterAnnDashData.data?.metrics?.announcements?.urgent === 1,
      'Integration 4 & Dashboard 6: Creating announcement reflects in announcement metrics'
    );

    console.log('\n=== Activity Feed & Isolation Verification ===');

    // Dashboard Test 8 & 9: Recent activity contains records for requested event sorted newest first
    const recentActivity = afterAnnDashData.data?.recentActivity;
    assert(
      Array.isArray(recentActivity) &&
        recentActivity.length >= 3 &&
        recentActivity.every((act) => act.eventId === testEventId),
      'Dashboard 8: Recent activity in dashboard contains records belonging exclusively to event'
    );

    const isSortedDesc = recentActivity.every((item, i, arr) => {
      if (i === 0) return true;
      return new Date(arr[i - 1].createdAt) >= new Date(item.createdAt);
    });
    assert(isSortedDesc, 'Dashboard 9: Recent activity is strictly sorted newest first');

    // Activity Feed: Standalone endpoint verification
    const standaloneActRes = await fetch(`${baseUrl}/api/events/${testEventId}/activity?limit=2`);
    const standaloneActData = await standaloneActRes.json();
    assert(
      standaloneActRes.status === 200 && standaloneActData.data.length === 2,
      'Activity Feed: Standalone endpoint respects query limit parameter'
    );

    // Activity Feed: GET does not create activity records
    const actCountBefore = await Activity.countDocuments({ eventId: testEventId });
    await fetch(`${baseUrl}/api/events/${testEventId}/activity`);
    await fetch(`${baseUrl}/api/events/${testEventId}/dashboard`);
    const actCountAfter = await Activity.countDocuments({ eventId: testEventId });
    assert(
      actCountBefore === actCountAfter,
      'Activity Feed & Dashboard: Read operations do not create extraneous activity records'
    );

    // Cross-event isolation check
    const otherEventId = `other-dash-evt-${Date.now()}`;
    await mongoose.connection.db.collection('events').insertOne({
      _id: otherEventId,
      name: 'Isolated Event',
      venue: 'North Arena',
    });
    const otherDashRes = await fetch(`${baseUrl}/api/events/${otherEventId}/dashboard`);
    const otherDashData = await otherDashRes.json();
    assert(
      otherDashData.data?.metrics?.tasks?.total === 0 &&
        otherDashData.data?.metrics?.incidents?.total === 0 &&
        otherDashData.data?.metrics?.announcements?.total === 0 &&
        otherDashData.data?.recentActivity.length === 0,
      'Isolation: Unrelated event dashboard does not expose data from another event'
    );

    console.log('\nCleaning up test data...');
    await Task.deleteMany({ eventId: testEventId });
    await Incident.deleteMany({ eventId: testEventId });
    await Announcement.deleteMany({ eventId: testEventId });
    await Activity.deleteMany({ eventId: { $in: [testEventId, otherEventId] } });
    await mongoose.connection.db.collection('events').deleteMany({
      _id: { $in: [testEventId, otherEventId] },
    });
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
