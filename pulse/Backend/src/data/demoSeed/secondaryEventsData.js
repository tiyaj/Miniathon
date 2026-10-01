import Zone from '../../models/Zone.js';
import Shift from '../../models/Shift.js';
import Role from '../../models/Role.js';
import Volunteer from '../../models/Volunteer.js';
import Assignment from '../../models/Assignment.js';
import Task from '../../models/Task.js';
import Incident from '../../models/Incident.js';
import Announcement from '../../models/Announcement.js';
import Activity from '../../models/Activity.js';

/**
 * Seeds realistic operational structures and data for the other 9 events:
 * - 2 Active events (live command center data)
 * - 4 Upcoming events (planned structures, prep tasks, upcoming announcements)
 * - 3 Completed events (historical attendance, resolved tasks/incidents, audit trail)
 */
export const seedSecondaryEventsData = async (events) => {
  const secondaryEvents = events.filter((e) => e.name !== 'PULSE Tech Summit 2026');

  for (const event of secondaryEvents) {
    const eventId = event._id.toString();
    const isCompleted = event.status === 'completed';
    const isUpcoming = event.status === 'upcoming';
    const isActive = event.status === 'active';

    // 1. ZONES FOR THIS EVENT
    let zoneNames = [];
    if (event.name.includes('Marathon')) {
      zoneNames = ['Start & Finish Line', 'Aid Station 1 (Worli)', 'Aid Station 2 (Bandra)', 'Medical Support Tent'];
    } else if (event.name.includes('Music')) {
      zoneNames = ['Main Music Stage', 'Folk & Acoustic Tent', 'Food & Artisan Village', 'Security Perimeter & Gates'];
    } else if (event.name.includes('College')) {
      zoneNames = ['SAC Auditorium', 'Gymkhana Grounds', 'Computer Centre Hub', 'Campus Security Gate'];
    } else if (event.name.includes('Sports')) {
      zoneNames = ['Athletic Track', 'Indoor Arena', 'Medal Ceremony Pavilion', 'Athlete First Aid Post'];
    } else if (event.name.includes('Developer')) {
      zoneNames = ['Plenary Hall', 'Cloud Workshop Lab', 'Expo Booths', 'Speakers Green Room'];
    } else {
      // General conferences / expos
      zoneNames = ['Exhibition Hall A', 'Conference Hall B', 'Registration Concourse', 'Networking Lounge'];
    }

    const zones = await Zone.insertMany(
      zoneNames.map((name, i) => ({
        event: event._id,
        eventId,
        name,
        description: `Operational coordination area for ${name} at ${event.name}`,
        capacity: 200 + i * 150,
        coordinatorName: `Coordinator ${i + 1}`,
      }))
    );

    // 2. SHIFTS FOR THIS EVENT
    const baseDate = event.startTime ? new Date(event.startTime) : new Date();
    const shifts = await Shift.insertMany([
      {
        event: event._id,
        eventId,
        zone: zones[0]._id,
        zoneId: zones[0]._id.toString(),
        name: 'Morning Shift',
        startTime: new Date(baseDate.getTime()),
        endTime: new Date(baseDate.getTime() + 4 * 3600000),
      },
      {
        event: event._id,
        eventId,
        zone: zones[1]._id,
        zoneId: zones[1]._id.toString(),
        name: 'Afternoon Shift',
        startTime: new Date(baseDate.getTime() + 4 * 3600000),
        endTime: new Date(baseDate.getTime() + 8 * 3600000),
      },
      {
        event: event._id,
        eventId,
        zone: zones[2]._id,
        zoneId: zones[2]._id.toString(),
        name: 'Evening Shift',
        startTime: new Date(baseDate.getTime() + 8 * 3600000),
        endTime: new Date(baseDate.getTime() + 12 * 3600000),
      },
    ]);

    // 3. ROLES FOR THIS EVENT
    const roles = await Role.insertMany([
      {
        event: event._id,
        eventId,
        zone: zones[0]._id,
        zoneId: zones[0]._id.toString(),
        shift: shifts[0]._id,
        shiftId: shifts[0]._id.toString(),
        name: 'Operations Marshal',
        description: `Coordinate operational execution and guide attendees at ${event.name}`,
        requiredSkills: ['communication', 'crowd-control'],
        capacity: 6,
        requiredCount: 6,
        priority: 'High',
      },
      {
        event: event._id,
        eventId,
        zone: zones[1]._id,
        zoneId: zones[1]._id.toString(),
        shift: shifts[1]._id,
        shiftId: shifts[1]._id.toString(),
        name: 'Guest Services Assistant',
        description: `Assist attendees with check-in, badges, and program info`,
        requiredSkills: ['communication', 'customer-service'],
        capacity: 5,
        requiredCount: 5,
        priority: 'Medium',
      },
      {
        event: event._id,
        eventId,
        zone: zones[2]._id,
        zoneId: zones[2]._id.toString(),
        shift: shifts[2]._id,
        shiftId: shifts[2]._id.toString(),
        name: 'Logistics Volunteer',
        description: `Manage equipment movement, seating arrangements, and replenishment`,
        requiredSkills: ['organization', 'communication'],
        capacity: 4,
        requiredCount: 4,
        priority: 'Low',
      },
    ]);

    // 4. VOLUNTEERS FOR THIS EVENT (4 dedicated volunteers per secondary event)
    const eventSlug = event.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const volunteers = await Volunteer.insertMany([
      {
        event: event._id,
        eventId,
        name: `Ramesh Iyer (${event.name.split(' ')[0]})`,
        email: `ramesh.${eventSlug}@pulse-demo.local`,
        phone: '+91 98333 11101',
        skills: ['communication', 'crowd-control', 'organization'],
        preferredZones: [zones[0]._id],
        availableShiftIds: [shifts[0]._id],
        totalHours: isCompleted ? 24 : 8,
        status: isCompleted ? 'completed' : 'available',
      },
      {
        event: event._id,
        eventId,
        name: `Kavita Nambiar (${event.name.split(' ')[0]})`,
        email: `kavita.${eventSlug}@pulse-demo.local`,
        phone: '+91 98333 11102',
        skills: ['communication', 'customer-service'],
        preferredZones: [zones[1]._id],
        availableShiftIds: [shifts[0]._id, shifts[1]._id],
        totalHours: isCompleted ? 20 : 6,
        status: isCompleted ? 'completed' : 'available',
      },
      {
        event: event._id,
        eventId,
        name: `Abhishek Saxena (${event.name.split(' ')[0]})`,
        email: `abhishek.${eventSlug}@pulse-demo.local`,
        phone: '+91 98333 11103',
        skills: ['organization', 'communication'],
        preferredZones: [zones[2]._id],
        availableShiftIds: [shifts[1]._id],
        totalHours: isCompleted ? 16 : 4,
        status: isCompleted ? 'completed' : 'available',
      },
      {
        event: event._id,
        eventId,
        name: `Sonalika Roy (${event.name.split(' ')[0]})`,
        email: `sonalika.${eventSlug}@pulse-demo.local`,
        phone: '+91 98333 11104',
        skills: ['customer-service', 'queue-management'],
        preferredZones: [zones[0]._id, zones[1]._id],
        availableShiftIds: [shifts[2]._id],
        totalHours: isCompleted ? 18 : 2,
        status: isCompleted ? 'completed' : 'available',
      },
    ]);

    // 5. ASSIGNMENTS
    if (isCompleted) {
      // All assignments completed with hours worked
      await Assignment.insertMany([
        {
          event: event._id,
          eventId,
          volunteer: volunteers[0]._id,
          volunteerId: volunteers[0]._id.toString(),
          shift: shifts[0]._id,
          shiftId: shifts[0]._id.toString(),
          role: roles[0]._id,
          roleId: roles[0]._id.toString(),
          status: 'completed',
          assignedAt: new Date(baseDate.getTime() - 48 * 3600000),
          checkedInAt: new Date(baseDate.getTime()),
          checkedOutAt: new Date(baseDate.getTime() + 4 * 3600000),
          hoursWorked: 4.0,
        },
        {
          event: event._id,
          eventId,
          volunteer: volunteers[1]._id,
          volunteerId: volunteers[1]._id.toString(),
          shift: shifts[1]._id,
          shiftId: shifts[1]._id.toString(),
          role: roles[1]._id,
          roleId: roles[1]._id.toString(),
          status: 'completed',
          assignedAt: new Date(baseDate.getTime() - 48 * 3600000),
          checkedInAt: new Date(baseDate.getTime() + 4 * 3600000),
          checkedOutAt: new Date(baseDate.getTime() + 8 * 3600000),
          hoursWorked: 4.0,
        },
        {
          event: event._id,
          eventId,
          volunteer: volunteers[2]._id,
          volunteerId: volunteers[2]._id.toString(),
          shift: shifts[2]._id,
          shiftId: shifts[2]._id.toString(),
          role: roles[2]._id,
          roleId: roles[2]._id.toString(),
          status: 'completed',
          assignedAt: new Date(baseDate.getTime() - 48 * 3600000),
          checkedInAt: new Date(baseDate.getTime() + 8 * 3600000),
          checkedOutAt: new Date(baseDate.getTime() + 12 * 3600000),
          hoursWorked: 4.0,
        },
      ]);
    } else if (isActive) {
      // Live event: some checked_in, some assigned, one dropped
      await Assignment.insertMany([
        {
          event: event._id,
          eventId,
          volunteer: volunteers[0]._id,
          volunteerId: volunteers[0]._id.toString(),
          shift: shifts[0]._id,
          shiftId: shifts[0]._id.toString(),
          role: roles[0]._id,
          roleId: roles[0]._id.toString(),
          status: 'checked_in',
          assignedAt: new Date(baseDate.getTime() - 24 * 3600000),
          checkedInAt: new Date(baseDate.getTime()),
          hoursWorked: 2.5,
        },
        {
          event: event._id,
          eventId,
          volunteer: volunteers[1]._id,
          volunteerId: volunteers[1]._id.toString(),
          shift: shifts[1]._id,
          shiftId: shifts[1]._id.toString(),
          role: roles[1]._id,
          roleId: roles[1]._id.toString(),
          status: 'assigned',
          assignedAt: new Date(baseDate.getTime() - 24 * 3600000),
        },
        {
          event: event._id,
          eventId,
          volunteer: volunteers[2]._id,
          volunteerId: volunteers[2]._id.toString(),
          shift: shifts[2]._id,
          shiftId: shifts[2]._id.toString(),
          role: roles[2]._id,
          roleId: roles[2]._id.toString(),
          status: 'assigned',
          assignedAt: new Date(baseDate.getTime() - 24 * 3600000),
        },
      ]);
    } else if (isUpcoming) {
      // Upcoming: planned assignments (status: assigned)
      await Assignment.insertMany([
        {
          event: event._id,
          eventId,
          volunteer: volunteers[0]._id,
          volunteerId: volunteers[0]._id.toString(),
          shift: shifts[0]._id,
          shiftId: shifts[0]._id.toString(),
          role: roles[0]._id,
          roleId: roles[0]._id.toString(),
          status: 'assigned',
          assignedAt: new Date(),
        },
        {
          event: event._id,
          eventId,
          volunteer: volunteers[1]._id,
          volunteerId: volunteers[1]._id.toString(),
          shift: shifts[1]._id,
          shiftId: shifts[1]._id.toString(),
          role: roles[1]._id,
          roleId: roles[1]._id.toString(),
          status: 'assigned',
          assignedAt: new Date(),
        },
      ]);
    }

    // 6. TASKS
    const tasks = await Task.insertMany([
      {
        eventId,
        zoneId: zones[0]._id.toString(),
        title: `Verify site perimeter security and safety gates for ${event.name}`,
        description: 'Ensure boundary fencing and gate signage are properly mounted.',
        priority: 'High',
        status: isCompleted ? 'Resolved' : isActive ? 'In Progress' : 'Open',
        assigneeVolunteerId: volunteers[0]._id.toString(),
      },
      {
        eventId,
        zoneId: zones[1]._id.toString(),
        title: `Test public address system and attendee orientation signage`,
        description: 'Verify wireless microphones and acoustic coverage across zones.',
        priority: 'Medium',
        status: isCompleted ? 'Resolved' : isActive ? 'Resolved' : 'Open',
        assigneeVolunteerId: volunteers[1]._id.toString(),
      },
      {
        eventId,
        zoneId: zones[2]._id.toString(),
        title: `Coordinate volunteer briefing and radio distribution`,
        description: 'Hand out radios, volunteer lanyards, and emergency contact card sheets.',
        priority: 'Low',
        status: isCompleted ? 'Resolved' : isActive ? 'Resolved' : 'In Progress',
        assigneeVolunteerId: volunteers[2]._id.toString(),
      },
    ]);

    // 7. INCIDENTS
    if (isCompleted) {
      await Incident.insertMany([
        {
          eventId,
          zoneId: zones[0]._id.toString(),
          title: 'Minor attendee wristband loss at entrance',
          type: 'Access Control',
          description: 'Attendee misplaced paper wristband; verified registration email and reissued credential.',
          severity: 'Low',
          status: 'Resolved',
          assignedCoordinator: 'Event Lead',
          acknowledgedAt: new Date(baseDate.getTime() + 1800000),
          resolvedAt: new Date(baseDate.getTime() + 3600000),
        },
      ]);
    } else if (isActive) {
      await Incident.insertMany([
        {
          eventId,
          zoneId: zones[0]._id.toString(),
          title: 'Entrance gate turnstile ticket scanner intermittent lag',
          type: 'Technical',
          description: 'Wireless signal fluctuating near Gate 2. IT support deployed with backup hotspot.',
          severity: 'Medium',
          status: 'Acknowledged',
          assignedCoordinator: 'Lead Coordinator',
          acknowledgedAt: new Date(baseDate.getTime() + 1200000),
        },
      ]);
    }
    // Upcoming events have 0 operational incidents (or just 1 prep incident if needed)

    // 8. ANNOUNCEMENTS
    await Announcement.insertMany([
      {
        eventId,
        title: `Welcome to ${event.name}`,
        message: isCompleted
          ? `Thank you to all attendees, partners, and volunteers for making ${event.name} a massive success!`
          : isUpcoming
          ? `Preparation for ${event.name} is underway. Volunteer schedules will be finalized 5 days prior.`
          : `Live coordination is active for ${event.name}. Report all status updates through PULSE.`,
        priority: 'Normal',
        audience: 'Everyone',
        status: 'Published',
        createdBy: 'Operations Directorate',
      },
      {
        eventId,
        title: `Volunteer Check-in Instructions for ${event.name}`,
        message: 'All team members please present your digital QR code at Zone 1 coordinator counter.',
        priority: 'Normal',
        audience: 'Everyone',
        status: 'Published',
        createdBy: 'Volunteer Coordinator',
      },
    ]);

    // 9. ACTIVITY RECORDS
    await Activity.insertMany([
      {
        eventId,
        type: 'event_created',
        message: `Event "${event.name}" scheduled and configured in PULSE`,
        entityType: 'Event',
        entityId: eventId,
        createdAt: new Date(baseDate.getTime() - 72 * 3600000),
      },
      {
        eventId,
        type: 'zones_configured',
        message: `4 operational zones defined for ${event.name}`,
        entityType: 'Zone',
        createdAt: new Date(baseDate.getTime() - 48 * 3600000),
      },
      {
        eventId,
        type: 'volunteers_assigned',
        message: `Volunteer roster assigned to operational roles at ${event.name}`,
        entityType: 'Assignment',
        createdAt: new Date(baseDate.getTime() - 24 * 3600000),
      },
    ]);
  }
};
