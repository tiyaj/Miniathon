import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import http from 'http';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';
import Event from '../src/models/Event.js';
import Volunteer from '../src/models/Volunteer.js';
import Assignment from '../src/models/Assignment.js';
import { getAuthHeaders, cleanupTestUsers } from './testAuthHelper.js';

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

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    status: response.status,
    body: data,
  };
}

async function runLiveCheck() {
  console.log('\n=== STARTING LIVE RESILIENCE & SIMULATOR SEMANTIC VERIFICATION ===');
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  try {
    const authHeaders = await getAuthHeaders('COORDINATOR');

    const event = await Event.findOne({ name: /PULSE Tech Summit/i });
    if (!event) throw new Error('Seeded event PULSE Tech Summit 2026 not found');
    const eventId = event._id.toString();
    console.log(`Using Event: ${event.name} (${eventId})`);

    // 1. GET /api/events/:eventId/resilience
    console.log('\n--- 1. Testing GET /api/events/:eventId/resilience ---');
    const resResil = await request(`/api/events/${eventId}/resilience`, {
      headers: authHeaders,
    });
    if (resResil.status !== 200) throw new Error(`Resilience endpoint returned ${resResil.status}`);

    const rData = resResil.body.data;
    console.log('Resilience Summary:');
    console.log('- Event Resilience Score:', rData.resilienceScore);
    console.log('- Event Risk Score:', rData.riskScore);
    console.log('- Event Risk Level:', rData.riskLevel);
    console.log('- Total Required:', rData.summary.totalRequired);
    console.log('- Total Assigned:', rData.summary.totalAssigned);
    console.log('- Total Vacancies:', rData.summary.totalVacancies);
    console.log('- Overall Coverage:', rData.summary.overallCoveragePercent + '%');
    console.log('- High Risk Areas Count:', rData.summary.highRiskAreas);
    console.log('- Low Risk Areas Count:', rData.summary.lowRiskAreas);

    // Verify semantic guardrail:
    if (rData.summary.overallCoveragePercent < 50 && rData.riskLevel === 'low') {
      throw new Error('FAIL: Severe undercoverage (<50%) was classified as LOW risk!');
    }
    console.log('>>> Semantic Check Passed: Undercovered event is correctly not classified as LOW risk.');

    // 2. POST /api/events/:eventId/simulate
    console.log('\n--- 2. Testing POST /api/events/:eventId/simulate ---');
    const activeAssignment = await Assignment.findOne({
      event: event._id,
      status: { $in: ['assigned', 'checked_in'] },
    }).populate('volunteer');

    if (!activeAssignment || !activeAssignment.volunteer) {
      throw new Error('No active assignment found to simulate dropout');
    }

    const volId = (activeAssignment.volunteer._id || activeAssignment.volunteer).toString();
    console.log(`Simulating dropout for volunteer: ${activeAssignment.volunteer.name || activeAssignment.volunteer.fullName} (${volId})`);

    // Snapshot DB records before simulation
    const volBefore = await Volunteer.findById(volId).lean();
    const assignBefore = await Assignment.findById(activeAssignment._id).lean();
    const countAssignBefore = await Assignment.countDocuments();
    const countVolBefore = await Volunteer.countDocuments();

    const simRes = await request(`/api/events/${eventId}/simulate`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        dropoutVolunteerIds: [volId],
      },
    });

    if (simRes.status !== 200) throw new Error(`Simulation endpoint returned ${simRes.status}`);

    const sData = simRes.body.data;
    console.log('Simulation Results:');
    console.log('- Current Coverage:', sData.coverage.current);
    console.log('- Projected Coverage:', sData.coverage.projected);
    console.log('- Coverage Change:', sData.coverage.change);
    console.log('- Affected Areas Count:', sData.affectedAreas.length);
    console.log('- Replacement Options Count:', sData.replacementOptions.length);
    console.log('- Recovery Projection:', sData.recovery);
    console.log('- Current Resilience:', sData.resilience.current);
    console.log('- Projected Resilience:', sData.resilience.projected);
    console.log('- Resilience Change:', sData.resilience.change);

    // Snapshot DB records after simulation
    const volAfter = await Volunteer.findById(volId).lean();
    const assignAfter = await Assignment.findById(activeAssignment._id).lean();
    const countAssignAfter = await Assignment.countDocuments();
    const countVolAfter = await Volunteer.countDocuments();

    console.log('\n--- 3. Verifying MongoDB Immutability ---');
    const isVolStatusUnchanged = volBefore.status === volAfter.status;
    const isAssignStatusUnchanged = assignBefore.status === assignAfter.status;
    const isAssignCountUnchanged = countAssignBefore === countAssignAfter;
    const isVolCountUnchanged = countVolBefore === countVolAfter;

    console.log('- Volunteer status unchanged:', isVolStatusUnchanged, `(${volBefore.status} === ${volAfter.status})`);
    console.log('- Assignment status unchanged:', isAssignStatusUnchanged, `(${assignBefore.status} === ${assignAfter.status})`);
    console.log('- Total assignments count unchanged:', isAssignCountUnchanged, `(${countAssignBefore} === ${countAssignAfter})`);
    console.log('- Total volunteers count unchanged:', isVolCountUnchanged, `(${countVolBefore} === ${countVolAfter})`);

    if (!isVolStatusUnchanged || !isAssignStatusUnchanged || !isAssignCountUnchanged || !isVolCountUnchanged) {
      throw new Error('FATAL: Database was mutated during simulation!');
    }

    console.log('>>> Database Immutability Check: PASSED with ZERO mutations.');
    console.log('\n=== LIVE SEMANTIC & SIMULATION VERIFICATION SUCCESSFUL ===\n');
  } finally {
    await cleanupTestUsers();
    server.close();
    await mongoose.disconnect();
  }
}

runLiveCheck().catch((err) => {
  console.error('Live check failed:', err);
  if (server) server.close();
  process.exit(1);
});
