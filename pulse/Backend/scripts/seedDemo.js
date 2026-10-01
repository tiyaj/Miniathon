import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../src/models/Event.js';
import Zone from '../src/models/Zone.js';
import Shift from '../src/models/Shift.js';
import Role from '../src/models/Role.js';
import Volunteer from '../src/models/Volunteer.js';
import Assignment from '../src/models/Assignment.js';
import Task from '../src/models/Task.js';
import Incident from '../src/models/Incident.js';
import Announcement from '../src/models/Announcement.js';
import Activity from '../src/models/Activity.js';
import User from '../src/models/User.js';
import connectDB from '../src/config/database.js';

import { seedDemoUsers, cleanDemoUsers } from '../src/data/demoSeed/demoUsers.js';
import { DEMO_EVENT_NAMES, seedDemoEvents } from '../src/data/demoSeed/demoEvents.js';
import { seedDemoVolunteers } from '../src/data/demoSeed/demoVolunteers.js';
import { seedHeroOperationalData } from '../src/data/demoSeed/heroOperationalData.js';
import { seedSecondaryEventsData } from '../src/data/demoSeed/secondaryEventsData.js';

dotenv.config();

/**
 * Clean existing demo events and their associated relational records.
 * NEVER touches user-created or third-party events.
 */
export const cleanDemoData = async () => {
  console.log('--- Cleaning previous demo dataset ---');

  // Find demo events matching known demo event names or demo patterns
  const demoEvents = await Event.find({
    $or: [
      { name: { $in: DEMO_EVENT_NAMES } },
      { name: /PULSE Tech Summit/i },
      { name: /TSEC TechFest/i },
    ],
  });

  const eventIds = demoEvents.map((e) => e._id);
  const eventIdStrings = eventIds.map((id) => id.toString());

  if (eventIds.length > 0) {
    const eventFilter = {
      $or: [{ event: { $in: eventIds } }, { eventId: { $in: eventIdStrings } }],
    };

    const [
      delAssignments,
      delTasks,
      delIncidents,
      delAnnouncements,
      delActivities,
      delRoles,
      delShifts,
      delZones,
      delVolunteers,
      delEvents,
    ] = await Promise.all([
      Assignment.deleteMany(eventFilter),
      Task.deleteMany({ eventId: { $in: eventIdStrings } }),
      Incident.deleteMany({ eventId: { $in: eventIdStrings } }),
      Announcement.deleteMany({ eventId: { $in: eventIdStrings } }),
      Activity.deleteMany({ eventId: { $in: eventIdStrings } }),
      Role.deleteMany(eventFilter),
      Shift.deleteMany(eventFilter),
      Zone.deleteMany(eventFilter),
      Volunteer.deleteMany({
        $or: [
          { event: { $in: eventIds } },
          { eventId: { $in: eventIdStrings } },
          { email: { $regex: /@pulse-demo\.local$/i } },
        ],
      }),
      Event.deleteMany({ _id: { $in: eventIds } }),
    ]);

    console.log(
      `Cleaned: ${delEvents.deletedCount} events, ${delZones.deletedCount} zones, ${delShifts.deletedCount} shifts, ${delRoles.deletedCount} roles, ${delVolunteers.deletedCount} volunteers, ${delAssignments.deletedCount} assignments, ${delTasks.deletedCount} tasks, ${delIncidents.deletedCount} incidents, ${delAnnouncements.deletedCount} announcements, ${delActivities.deletedCount} activities`
    );
  } else {
    console.log('No prior demo events found to clean.');
  }

  const cleanedUsers = await cleanDemoUsers();
  console.log(`Cleaned: ${cleanedUsers} demo auth users.`);
};

/**
 * Validate relational integrity and consistency of the seeded dataset.
 */
export const validateSeedIntegrity = async () => {
  console.log('\n--- Running Automated Seed Relational Validation ---');
  const errors = [];

  // 1. Validate Events
  const events = await Event.find({ name: { $in: DEMO_EVENT_NAMES } });
  if (events.length !== 10) {
    errors.push(`Expected 10 demo events, found ${events.length}`);
  }

  // 2. Validate Demo Users
  const users = await User.find({ email: { $regex: /@pulse-demo\.local$/i } });
  if (users.length < 4) {
    errors.push(`Expected at least 4 demo RBAC users, found ${users.length}`);
  }
  for (const u of users) {
    if (!u.isEmailVerified || !u.isActive) {
      errors.push(`User ${u.email} is not email verified or active`);
    }
  }

  // 3. Validate Hero Event
  const hero = events.find((e) => e.name === 'PULSE Tech Summit 2026');
  if (!hero) {
    errors.push('Hero Event "PULSE Tech Summit 2026" not found');
    return errors;
  }
  const heroId = hero._id.toString();

  const [heroZones, heroShifts, heroRoles, heroAssignments, heroTasks, heroIncidents, heroAnnouncements, heroActivities] =
    await Promise.all([
      Zone.find({ eventId: heroId }),
      Shift.find({ eventId: heroId }),
      Role.find({ eventId: heroId }),
      Assignment.find({ eventId: heroId }),
      Task.find({ eventId: heroId }),
      Incident.find({ eventId: heroId }),
      Announcement.find({ eventId: heroId }),
      Activity.find({ eventId: heroId }),
    ]);

  if (heroZones.length < 8) errors.push(`Hero zones expected >= 8, got ${heroZones.length}`);
  if (heroShifts.length < 8) errors.push(`Hero shifts expected >= 8, got ${heroShifts.length}`);
  if (heroRoles.length < 10) errors.push(`Hero roles expected >= 10, got ${heroRoles.length}`);
  if (heroAssignments.length < 40) errors.push(`Hero assignments expected >= 40, got ${heroAssignments.length}`);
  if (heroTasks.length < 25) errors.push(`Hero tasks expected >= 25, got ${heroTasks.length}`);
  if (heroIncidents.length < 15) errors.push(`Hero incidents expected >= 15, got ${heroIncidents.length}`);
  if (heroAnnouncements.length < 10) errors.push(`Hero announcements expected >= 10, got ${heroAnnouncements.length}`);
  if (heroActivities.length < 50) errors.push(`Hero activities expected >= 50, got ${heroActivities.length}`);

  // 4. Validate Assignment References
  const zoneIdSet = new Set(heroZones.map((z) => z._id.toString()));
  const shiftIdSet = new Set(heroShifts.map((s) => s._id.toString()));
  const roleIdSet = new Set(heroRoles.map((r) => r._id.toString()));

  const volunteers = await Volunteer.find({ eventId: heroId });
  const volIdSet = new Set(volunteers.map((v) => v._id.toString()));

  for (const a of heroAssignments) {
    if (a.shiftId && !shiftIdSet.has(a.shiftId.toString())) {
      errors.push(`Dangling shiftId ${a.shiftId} in assignment ${a._id}`);
    }
    if (a.roleId && !roleIdSet.has(a.roleId.toString())) {
      errors.push(`Dangling roleId ${a.roleId} in assignment ${a._id}`);
    }
    if (a.volunteerId && !volIdSet.has(a.volunteerId.toString())) {
      errors.push(`Dangling volunteerId ${a.volunteerId} in assignment ${a._id}`);
    }
  }

  // 5. Validate Task & Incident zone references
  for (const t of heroTasks) {
    if (t.zoneId && !zoneIdSet.has(t.zoneId.toString())) {
      errors.push(`Dangling zoneId ${t.zoneId} in task ${t._id}`);
    }
  }
  for (const inc of heroIncidents) {
    if (inc.zoneId && !zoneIdSet.has(inc.zoneId.toString())) {
      errors.push(`Dangling zoneId ${inc.zoneId} in incident ${inc._id}`);
    }
  }

  if (errors.length === 0) {
    console.log('✅ All relational integrity checks passed (0 errors found).');
  } else {
    console.error('❌ Validation errors encountered:', errors);
  }

  return errors;
};

/**
 * Main Demo Seeding Runner.
 */
export const runDemoSeed = async () => {
  console.log('============================================================');
  console.log('  PULSE BACKEND — PROFESSIONAL DEMO SEED DATA GENERATOR');
  console.log('============================================================\n');

  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  try {
    // 1. Clean previous demo records (idempotent)
    await cleanDemoData();

    // 2. Seed Demo RBAC Users
    console.log('\n--- Seeding Demo RBAC Users ---');
    const createdUsers = await seedDemoUsers();
    console.log(`Seeded ${createdUsers.length} demo RBAC users:`);
    createdUsers.forEach((u) => console.log(`  - [${u.role}] ${u.email} (${u.name})`));

    // 3. Seed 10 Demo Events
    console.log('\n--- Seeding 10 Demo Events ---');
    const createdEvents = await seedDemoEvents();
    const activeEvents = createdEvents.filter((e) => e.status === 'active');
    const upcomingEvents = createdEvents.filter((e) => e.status === 'upcoming');
    const completedEvents = createdEvents.filter((e) => e.status === 'completed');

    console.log(`Seeded ${createdEvents.length} events:`);
    console.log(`  - Active (${activeEvents.length}): ${activeEvents.map((e) => e.name).join(', ')}`);
    console.log(`  - Upcoming (${upcomingEvents.length}): ${upcomingEvents.map((e) => e.name).join(', ')}`);
    console.log(`  - Completed (${completedEvents.length}): ${completedEvents.map((e) => e.name).join(', ')}`);

    const heroEvent = createdEvents.find((e) => e.name === 'PULSE Tech Summit 2026');

    // 4. Seed Volunteers
    console.log('\n--- Seeding Demo Volunteers ---');
    const heroVolunteers = await seedDemoVolunteers(heroEvent);
    console.log(`Seeded ${heroVolunteers.length} realistic volunteers with authentic skill groups A–E.`);

    // 5. Seed Hero Event Operational Data
    console.log('\n--- Seeding Hero Event Operational Data ("PULSE Tech Summit 2026") ---');
    const heroData = await seedHeroOperationalData(heroEvent, heroVolunteers);
    console.log(`Hero Event populated with:`);
    console.log(`  - Zones: ${heroData.zones.length}`);
    console.log(`  - Shifts: ${heroData.shifts.length}`);
    console.log(`  - Roles: ${heroData.roles.length}`);
    console.log(`  - Assignments: ${heroData.assignments.length}`);
    console.log(`  - Tasks: ${heroData.tasks.length}`);
    console.log(`  - Incidents: ${heroData.incidents.length}`);
    console.log(`  - Announcements: ${heroData.announcements.length}`);
    console.log(`  - Activities: ${heroData.activities.length}`);

    // 6. Seed Secondary Events
    console.log('\n--- Seeding Secondary Events Data (9 Events) ---');
    await seedSecondaryEventsData(createdEvents);
    console.log('Seeded operational structures, assignments, tasks, and history for secondary events.');

    // 7. Validate Database Relational Integrity
    const errors = await validateSeedIntegrity();
    if (errors.length > 0) {
      throw new Error(`Seed validation failed with ${errors.length} errors.`);
    }

    // 8. Overall Database Statistics
    console.log('\n============================================================');
    console.log('  DEMO SEEDING COMPLETE — OPERATIONAL METRICS SUMMARY');
    console.log('============================================================');
    const [totEvents, totUsers, totVols, totZones, totShifts, totRoles, totAssign, totTasks, totIncs, totAnn, totActs] =
      await Promise.all([
        Event.countDocuments({ name: { $in: DEMO_EVENT_NAMES } }),
        User.countDocuments({ email: { $regex: /@pulse-demo\.local$/i } }),
        Volunteer.countDocuments({ email: { $regex: /@pulse-demo\.local$/i } }),
        Zone.countDocuments(),
        Shift.countDocuments(),
        Role.countDocuments(),
        Assignment.countDocuments(),
        Task.countDocuments(),
        Incident.countDocuments(),
        Announcement.countDocuments(),
        Activity.countDocuments(),
      ]);

    console.log(`Total Demo Events:       ${totEvents} (3 Active, 4 Upcoming, 3 Completed)`);
    console.log(`Total Demo Users:        ${totUsers} (SUPER_ADMIN, ADMIN, COORDINATOR, VOLUNTEER)`);
    console.log(`Total Demo Volunteers:   ${totVols} (Groups A, B, C, D, E)`);
    console.log(`Total Zones:             ${totZones}`);
    console.log(`Total Shifts:            ${totShifts}`);
    console.log(`Total Roles:             ${totRoles}`);
    console.log(`Total Assignments:       ${totAssign}`);
    console.log(`Total Tasks:             ${totTasks}`);
    console.log(`Total Incidents:         ${totIncs}`);
    console.log(`Total Announcements:     ${totAnn}`);
    console.log(`Total Activity Records:  ${totActs}`);
    console.log('============================================================\n');

    return {
      events: totEvents,
      users: totUsers,
      volunteers: totVols,
      zones: totZones,
      shifts: totShifts,
      roles: totRoles,
      assignments: totAssign,
      tasks: totTasks,
      incidents: totIncs,
      announcements: totAnn,
      activities: totActs,
    };
  } finally {
    if (process.argv[1] && process.argv[1].endsWith('seedDemo.js')) {
      await mongoose.connection.close();
      console.log('Database connection closed cleanly.');
    }
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedDemo.js')) {
  runDemoSeed()
    .then(() => {
      console.log('Demo seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Demo seeding failed:', err);
      process.exit(1);
    });
}

export default runDemoSeed;
