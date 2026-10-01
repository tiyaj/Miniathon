import { enableTestAuthInterceptor } from './testAuthHelper.js';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import Announcement from '../src/models/Announcement.js';
import Activity, { logActivity } from '../src/models/Activity.js';

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

    const testEventId = `test-ann-evt-${Date.now()}`;
    const emptyEventId = `empty-ann-evt-${Date.now()}`;
    let annId1 = null;

    console.log('=== Integration Checks ===');

    // Integration check: Health endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.data?.status === 'ok',
      'Integration: Health check endpoint /api/health works'
    );

    // Integration check: Task routes still work
    const taskRes = await fetch(`${baseUrl}/api/events/${testEventId}/tasks`);
    const taskData = await taskRes.json();
    assert(
      taskRes.status === 200 && Array.isArray(taskData.data),
      'Integration: Task endpoints from Part 1 remain working'
    );

    // Integration check: Incident routes still work
    const incRes = await fetch(`${baseUrl}/api/events/${testEventId}/incidents`);
    const incData = await incRes.json();
    assert(
      incRes.status === 200 && Array.isArray(incData.data),
      'Integration: Incident endpoints from Part 2 remain working'
    );

    console.log('\n=== Announcement Failure Scenarios ===');

    // Failure 7: Reject a missing title
    const f7Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'No title provided here',
        audience: 'Everyone',
      }),
    });
    const f7Data = await f7Res.json();
    assert(
      f7Res.status === 400 && f7Data.error?.code === 'VALIDATION_ERROR',
      'Announcement Failure 7: Reject missing title (400 VALIDATION_ERROR)'
    );

    // Failure 8: Reject a missing message
    const f8Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Only title here',
        audience: 'Everyone',
      }),
    });
    const f8Data = await f8Res.json();
    assert(
      f8Res.status === 400 && f8Data.error?.code === 'VALIDATION_ERROR',
      'Announcement Failure 8: Reject missing message (400 VALIDATION_ERROR)'
    );

    // Failure 9: Reject an invalid priority
    const f9Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Schedule Change',
        message: 'Keynote starts now',
        priority: 'SuperUrgent',
      }),
    });
    const f9Data = await f9Res.json();
    assert(
      f9Res.status === 400 && f9Data.error?.code === 'INVALID_PRIORITY',
      'Announcement Failure 9: Reject invalid priority (400 INVALID_PRIORITY)'
    );

    // Failure 10: Reject an invalid audience
    const f10Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Schedule Change',
        message: 'Keynote starts now',
        audience: 'PublicGuests',
      }),
    });
    const f10Data = await f10Res.json();
    assert(
      f10Res.status === 400 && f10Data.error?.code === 'INVALID_AUDIENCE',
      'Announcement Failure 10: Reject invalid audience (400 INVALID_AUDIENCE)'
    );

    // Failure 11: Reject Zone audience without a zone ID
    const f11Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Gate Alert',
        message: 'Clear lane 1',
        audience: 'Zone',
      }),
    });
    const f11Data = await f11Res.json();
    assert(
      f11Res.status === 400 && f11Data.error?.code === 'VALIDATION_ERROR',
      'Announcement Failure 11: Reject Zone audience without a zone ID (400 VALIDATION_ERROR)'
    );

    // Failure 12: Reject invalid zone reference (belonging to another event)
    const existingZone = await mongoose.connection.db.collection('zones').findOne();
    const wrongEventId = 'other-event-777';
    const f12Res = await fetch(`${baseUrl}/api/events/${wrongEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Gate Alert',
        message: 'Clear lane 1',
        audience: 'Zone',
        zoneId: existingZone ? existingZone._id.toString() : 'invalid-zone-id',
      }),
    });
    const f12Data = await f12Res.json();
    assert(
      f12Res.status === 400 &&
        (f12Data.error?.code === 'INVALID_ZONE' || f12Data.error?.code === 'ZONE_NOT_FOUND'),
      'Announcement Failure 12: Reject zone belonging to different event (400 INVALID_ZONE / ZONE_NOT_FOUND)'
    );

    console.log('\n=== Announcement Successful Scenarios ===');

    // Success 1: Successfully create an announcement for Everyone (with Urgent priority)
    const s1Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Main Arena Keynote Starting',
        message: 'All volunteers and attendees please assemble at Main Arena.',
        audience: 'Everyone',
        priority: 'Urgent',
        _id: 'attempt-overwrite-id',
        createdAt: '2020-01-01T00:00:00.000Z',
      }),
    });
    const s1Data = await s1Res.json();
    annId1 = s1Data.data?.id || s1Data.data?._id;
    assert(
      s1Res.status === 201 &&
        s1Data.data?.title === 'Main Arena Keynote Starting' &&
        s1Data.data?.audience === 'Everyone' &&
        s1Data.data?.priority === 'Urgent' &&
        s1Data.data?.status === 'Published' &&
        s1Data.data?._id !== 'attempt-overwrite-id' &&
        new Date(s1Data.data?.createdAt).getFullYear() >= 2026,
      'Announcement Success 1 & 14: Successfully create announcement and protect system fields (201 Created)'
    );

    // Create a 2nd announcement targeting a specific zone
    const s1bRes = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Entry Gate Inspection',
        message: 'Security briefing in 5 minutes at Entry Gate.',
        audience: 'Zone',
        zoneId: 'zone-entry',
        priority: 'Normal',
      }),
    });
    const s1bData = await s1bRes.json();
    assert(
      s1bRes.status === 201 &&
        s1bData.data?.audience === 'Zone' &&
        s1bData.data?.zoneId === 'zone-entry' &&
        s1bData.data?.priority === 'Normal',
      'Announcement Success 1b: Successfully create announcement targeting a specific zone (201 Created)'
    );

    // Success 2: Successfully retrieve announcements for an event
    const s2Res = await fetch(`${baseUrl}/api/events/${testEventId}/announcements`);
    const s2Data = await s2Res.json();
    assert(
      s2Res.status === 200 &&
        Array.isArray(s2Data.data) &&
        s2Data.data.length === 2 &&
        s2Data.data.every((a) => a.eventId === testEventId),
      'Announcement Success 2: Retrieve announcements for an event (200 OK)'
    );

    // Success 3 & 13: Retrieve empty list when no announcements exist & no cross-event leakage
    const s3Res = await fetch(`${baseUrl}/api/events/${emptyEventId}/announcements`);
    const s3Data = await s3Res.json();
    assert(
      s3Res.status === 200 &&
        Array.isArray(s3Data.data) &&
        s3Data.data.length === 0,
      'Announcement Success 3 & 13: Return empty array for event without announcements (no cross-event leakage)'
    );

    // Success 4: Filter announcements by priority
    const s4Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/announcements?priority=Urgent`
    );
    const s4Data = await s4Res.json();
    assert(
      s4Res.status === 200 &&
        s4Data.data.length === 1 &&
        s4Data.data[0].priority === 'Urgent',
      'Announcement Success 4: Filter announcements by priority (Urgent)'
    );

    // Success 5: Filter announcements by audience
    const s5Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/announcements?audience=Zone`
    );
    const s5Data = await s5Res.json();
    assert(
      s5Res.status === 200 &&
        s5Data.data.length === 1 &&
        s5Data.data[0].audience === 'Zone',
      'Announcement Success 5: Filter announcements by audience (Zone)'
    );

    // Success 6: Filter announcements by zone
    const s6Res = await fetch(
      `${baseUrl}/api/events/${testEventId}/announcements?zoneId=zone-entry`
    );
    const s6Data = await s6Res.json();
    assert(
      s6Res.status === 200 &&
        s6Data.data.length === 1 &&
        s6Data.data[0].zoneId === 'zone-entry',
      'Announcement Success 6: Filter announcements by zoneId (zone-entry)'
    );

    console.log('\n=== Activity Logging Scenarios ===');

    // Activity 1 & 2: Creating announcement creates expected activity record with eventId & details
    const actRes = await fetch(`${baseUrl}/api/events/${testEventId}/activity`);
    const actData = await actRes.json();
    assert(
      actRes.status === 200 &&
        Array.isArray(actData.data) &&
        actData.data.length >= 2 &&
        actData.data.every((a) => a.eventId === testEventId) &&
        actData.data.some((a) => (a.type || a.action) === 'announcement_created'),
      'Activity 1 & 2: Creating an announcement produces corresponding activity records with correct eventId'
    );

    // Activity 3: Activity endpoint returns records for requested event only
    const emptyActRes = await fetch(`${baseUrl}/api/events/${emptyEventId}/activity`);
    const emptyActData = await emptyActRes.json();
    assert(
      emptyActRes.status === 200 &&
        Array.isArray(emptyActData.data) &&
        emptyActData.data.length === 0,
      'Activity 3 & 6: Empty activity history returns valid empty list with no cross-event records'
    );

    // Activity 4: Activity sorted newest first
    const timestamps = actData.data.map((a) => new Date(a.createdAt).getTime());
    const isSorted = timestamps.every((val, i, arr) => !i || arr[i - 1] >= val);
    assert(isSorted, 'Activity 4: Activity feed is sorted newest first');

    // Activity 5: Retrieving activity does not create new activity records
    const actCountBefore = await Activity.countDocuments({ eventId: testEventId });
    await fetch(`${baseUrl}/api/events/${testEventId}/activity`);
    await fetch(`${baseUrl}/api/events/${testEventId}/activity`);
    const actCountAfter = await Activity.countDocuments({ eventId: testEventId });
    assert(
      actCountBefore === actCountAfter,
      'Activity 5: GET /activity requests do NOT generate new activity records'
    );

    // Activity with limit parameter
    const limitedActRes = await fetch(`${baseUrl}/api/events/${testEventId}/activity?limit=1`);
    const limitedActData = await limitedActRes.json();
    assert(
      limitedActRes.status === 200 && limitedActData.data.length === 1,
      'Activity Feed: Limit query parameter limits returned records'
    );

    // Activity 7: Activity logging errors are handled non-blockingly
    const badLogResult = await logActivity(null, null, null);
    assert(
      badLogResult === null,
      'Activity 7: Activity logging error is handled gracefully without crashing caller'
    );

    console.log('\nCleaning up test data...');
    await Announcement.deleteMany({ eventId: testEventId });
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
