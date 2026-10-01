import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import Volunteer from '../models/Volunteer.js';
import Assignment from '../models/Assignment.js';

export const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Cleaning up existing demo seed data...');
    const seedEventName = 'PULSE Tech Summit 2026';
    const existingEvents = await Event.find({
      $or: [
        { name: seedEventName },
        { name: /PULSE Tech Summit/i },
        { name: /TSEC TechFest/i },
      ],
    });

    const eventIds = existingEvents.map((e) => e._id);
    if (eventIds.length > 0) {
      await Promise.all([
        Assignment.deleteMany({ $or: [{ event: { $in: eventIds } }, { eventId: { $in: eventIds.map((id) => id.toString()) } }] }),
        Zone.deleteMany({ $or: [{ event: { $in: eventIds } }, { eventId: { $in: eventIds.map((id) => id.toString()) } }] }),
        Shift.deleteMany({ $or: [{ event: { $in: eventIds } }, { eventId: { $in: eventIds.map((id) => id.toString()) } }] }),
        Role.deleteMany({ $or: [{ event: { $in: eventIds } }, { eventId: { $in: eventIds.map((id) => id.toString()) } }] }),
        Event.deleteMany({ _id: { $in: eventIds } }),
      ]);
    }

    const seedEmails = [
      'rahul.sharma@example.com',
      'priya.patel@example.com',
      'amit.verma@example.com',
      'sneha.kulkarni@example.com',
      'rohan.mehta@example.com',
      'ananya.iyer@example.com',
      'vikram.singh@example.com',
      'neha.gupta@example.com',
    ];

    const existingVols = await Volunteer.find({ email: { $in: seedEmails } });
    if (existingVols.length > 0) {
      await Assignment.deleteMany({ volunteer: { $in: existingVols.map((v) => v._id) } });
      await Volunteer.deleteMany({ email: { $in: seedEmails } });
    }

    console.log('Creating demo Event...');
    const event = await Event.create({
      name: seedEventName,
      description: 'Annual premier technology conference featuring keynote speakers, developer workshops, and networking zones (TSEC TechFest - Main Arena).',
      venue: 'Campus Event Grounds, Main Arena',
      startTime: new Date('2026-10-15T08:00:00.000Z'),
      endTime: new Date('2026-10-15T20:00:00.000Z'),
      status: 'active',
    });

    console.log('Creating demo Zones...');
    const zones = await Zone.insertMany([
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Entry Gate',
        description: 'Primary attendee check-in and security screening area',
        capacity: 1500,
        coordinatorName: 'Aarav Patel',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Food Court',
        description: 'Dining and refreshment pavilion',
        capacity: 800,
        coordinatorName: 'Meera Sen',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Main Stage',
        description: 'Keynote presentation and panel discussion stage',
        capacity: 1200,
        coordinatorName: 'Devendra Joshi',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'First Aid',
        description: 'On-site medical triage and paramedic station',
        capacity: 100,
        coordinatorName: 'Dr. Anita Roy',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Parking',
        description: 'Vehicle management and transit hub',
        capacity: 500,
        coordinatorName: 'Kunal Deshmukh',
      },
    ]);

    const [entryGate, foodCourt, mainStage, firstAidZone] = zones;

    console.log('Creating demo Shifts...');
    const shift1 = await Shift.create({
      event: event._id,
      eventId: event._id.toString(),
      zone: entryGate._id,
      zoneId: entryGate._id.toString(),
      name: 'Morning Check-in & Setup',
      startTime: new Date('2026-10-15T08:00:00.000Z'),
      endTime: new Date('2026-10-15T12:00:00.000Z'),
    });

    const shift2 = await Shift.create({
      event: event._id,
      eventId: event._id.toString(),
      zone: mainStage._id,
      zoneId: mainStage._id.toString(),
      name: 'Afternoon Crowd Patrol',
      startTime: new Date('2026-10-15T12:00:00.000Z'),
      endTime: new Date('2026-10-15T16:00:00.000Z'),
    });

    const shift3 = await Shift.create({
      event: event._id,
      eventId: event._id.toString(),
      zone: foodCourt._id,
      zoneId: foodCourt._id.toString(),
      name: 'Evening Wrap-up & Logistics',
      startTime: new Date('2026-10-15T16:00:00.000Z'),
      endTime: new Date('2026-10-15T20:00:00.000Z'),
    });

    const shifts = [shift1, shift2, shift3];

    console.log('Creating demo Roles...');
    const roles = await Role.insertMany([
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Crowd Marshal',
        description: 'Direct crowd flow and maintain safety protocols in high-traffic zones',
        requiredSkills: ['crowd-control', 'communication'],
        capacity: 10,
        requiredCount: 10,
        priority: 'High',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Registration Volunteer',
        description: 'Scan credentials, check in attendees, and distribute delegate badges',
        requiredSkills: ['check-in', 'customer-service'],
        capacity: 8,
        requiredCount: 8,
        priority: 'Medium',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'First Aid Support',
        description: 'Provide basic medical triage and assist on-site paramedics',
        requiredSkills: ['first-aid', 'emergency-response'],
        capacity: 4,
        requiredCount: 4,
        priority: 'High',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        name: 'Help Desk Assistant',
        description: 'Assist visitors with directions, lost items, and general summit guidance',
        requiredSkills: ['customer-service', 'navigation'],
        capacity: 6,
        requiredCount: 6,
        priority: 'Low',
      },
    ]);

    const [crowdMarshalRole, regRole, firstAidRole] = roles;

    console.log('Creating demo Volunteers...');
    const volunteersData = [
      {
        eventId: event._id.toString(),
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        skills: ['crowd-control', 'communication'],
        preferredZones: [entryGate._id, mainStage._id],
        availableShiftIds: [shift1._id, shift2._id],
        status: 'available',
        totalHours: 12,
      },
      {
        eventId: event._id.toString(),
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 98765 43211',
        skills: ['check-in', 'customer-service'],
        preferredZones: [entryGate._id],
        availableShiftIds: [shift1._id],
        status: 'available',
        totalHours: 8,
      },
      {
        eventId: event._id.toString(),
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        phone: '+91 98765 43212',
        skills: ['first-aid', 'emergency-response'],
        preferredZones: [mainStage._id, firstAidZone._id],
        availableShiftIds: [shift2._id, shift3._id],
        status: 'available',
        totalHours: 15,
      },
      {
        eventId: event._id.toString(),
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@example.com',
        phone: '+91 98765 43213',
        skills: ['customer-service', 'navigation'],
        preferredZones: [foodCourt._id],
        availableShiftIds: [shift2._id],
        status: 'available',
        totalHours: 6,
      },
      {
        eventId: event._id.toString(),
        name: 'Rohan Mehta',
        email: 'rohan.mehta@example.com',
        phone: '+91 98765 43214',
        skills: ['crowd-control', 'communication'],
        preferredZones: [entryGate._id, mainStage._id],
        availableShiftIds: [shift1._id, shift3._id],
        status: 'assigned',
        totalHours: 20,
      },
      {
        eventId: event._id.toString(),
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        phone: '+91 98765 43215',
        skills: ['first-aid', 'cpr'],
        preferredZones: [entryGate._id, firstAidZone._id],
        availableShiftIds: [shift1._id],
        status: 'available',
        totalHours: 10,
      },
      {
        eventId: event._id.toString(),
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43216',
        skills: ['communication', 'navigation'],
        preferredZones: [mainStage._id],
        availableShiftIds: [shift2._id, shift3._id],
        status: 'available',
        totalHours: 4,
      },
      {
        eventId: event._id.toString(),
        name: 'Neha Gupta',
        email: 'neha.gupta@example.com',
        phone: '+91 98765 43217',
        skills: ['check-in', 'customer-service'],
        preferredZones: [foodCourt._id, entryGate._id],
        availableShiftIds: [shift3._id],
        status: 'available',
        totalHours: 0,
      },
    ];

    const createdVolunteers = await Volunteer.insertMany(volunteersData);
    const [rahul, priya, amit, sneha, rohan] = createdVolunteers;

    console.log('Creating demo Assignments...');
    await Assignment.insertMany([
      {
        event: event._id,
        eventId: event._id.toString(),
        shift: shift1._id,
        shiftId: shift1._id.toString(),
        role: crowdMarshalRole._id,
        roleId: crowdMarshalRole._id.toString(),
        volunteer: rahul._id,
        volunteerId: rahul._id.toString(),
        status: 'assigned',
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        shift: shift1._id,
        shiftId: shift1._id.toString(),
        role: regRole._id,
        roleId: regRole._id.toString(),
        volunteer: priya._id,
        volunteerId: priya._id.toString(),
        status: 'checked_in',
        checkedInAt: new Date('2026-10-15T08:05:00.000Z'),
      },
      {
        event: event._id,
        eventId: event._id.toString(),
        shift: shift1._id,
        shiftId: shift1._id.toString(),
        role: firstAidRole._id,
        roleId: firstAidRole._id.toString(),
        volunteer: rohan._id,
        volunteerId: rohan._id.toString(),
        status: 'dropped',
      },
    ]);

    console.log('Demo seed data created successfully!');
    console.log(`- 1 Event: "${event.name}" (${event._id})`);
    console.log(`- ${zones.length} Zones: Entry Gate, Food Court, Main Stage, First Aid, Parking`);
    console.log(`- ${shifts.length} Shifts: Morning, Afternoon, Evening`);
    console.log(`- ${roles.length} Roles: Crowd Marshal, Registration, First Aid, Help Desk`);
    console.log(`- ${volunteersData.length} Volunteers created`);
    console.log('- 3 Initial Assignments created (1 assigned, 1 checked_in, 1 dropped)');

    if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  } catch (error) {
    console.error('Seeding failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}

export default seedDatabase;
