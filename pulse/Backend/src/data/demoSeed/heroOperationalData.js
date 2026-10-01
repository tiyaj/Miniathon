import Zone from '../../models/Zone.js';
import Shift from '../../models/Shift.js';
import Role from '../../models/Role.js';
import Assignment from '../../models/Assignment.js';
import Task from '../../models/Task.js';
import Incident from '../../models/Incident.js';
import Announcement from '../../models/Announcement.js';
import Activity from '../../models/Activity.js';

/**
 * Seeds all operational structures and rich live data for the Hero Event:
 * "PULSE Tech Summit 2026"
 */
export const seedHeroOperationalData = async (heroEvent, volunteers) => {
  const eventId = heroEvent._id.toString();

  // 1. CREATE 10 OPERATIONAL ZONES
  const zonesData = [
    {
      name: 'Main Entrance',
      description: 'Primary turnstiles, metal detector scanning, and attendee security screening',
      capacity: 2500,
      coordinatorName: 'Rajesh Kulkarni',
    },
    {
      name: 'Registration Area',
      description: 'Badging counters, attendee registration terminals, and kit distribution',
      capacity: 1500,
      coordinatorName: 'Sunita Menon',
    },
    {
      name: 'Main Stage',
      description: 'Grand auditorium for plenary keynotes, product launches, and fireside chats',
      capacity: 3500,
      coordinatorName: 'Vikram Sengupta',
    },
    {
      name: 'Food Court',
      description: 'Multi-vendor catering pavilions, dining tables, and refreshment stations',
      capacity: 1800,
      coordinatorName: 'Pooja Bhatia',
    },
    {
      name: 'Workshop Hall',
      description: 'Hands-on developer labs, breakout rooms, and hackathon workspace',
      capacity: 600,
      coordinatorName: 'Kunal Deshmukh',
    },
    {
      name: 'Parking Zone',
      description: 'Basement visitor parking, VIP valet staging, and bus shuttle transit lanes',
      capacity: 1200,
      coordinatorName: 'Harish Nambiar',
    },
    {
      name: 'First Aid Center',
      description: 'On-site medical triage clinic, paramedic rest post, and ambulance docking',
      capacity: 100,
      coordinatorName: 'Dr. Anjali Sawant',
    },
    {
      name: 'VIP Lounge',
      description: 'Executive hospitality suite, bilateral meeting rooms, and media green room',
      capacity: 250,
      coordinatorName: 'Kavita Chawla',
    },
    {
      name: 'Central Help Desk',
      description: 'General attendee support, lost and found locker, and campus directions',
      capacity: 400,
      coordinatorName: 'Farhan Qureshi',
    },
    {
      name: 'Exit Gate & Transit',
      description: 'Egress corridors, rideshare pickup bays, and city transit access gates',
      capacity: 2000,
      coordinatorName: 'Sameer Verma',
    },
  ];

  const zones = await Zone.insertMany(
    zonesData.map((z) => ({
      ...z,
      event: heroEvent._id,
      eventId,
    }))
  );

  const [
    mainEntrance,
    registrationArea,
    mainStage,
    foodCourt,
    workshopHall,
    parkingZone,
    firstAidCenter,
    vipLounge,
    helpDesk,
    exitGate,
  ] = zones;

  // 2. CREATE 10 OPERATIONAL SHIFTS
  const day1 = '2026-10-01';
  const day2 = '2026-10-02';
  const shiftsData = [
    {
      name: 'Morning Setup & Ingress',
      zone: mainEntrance._id,
      zoneId: mainEntrance._id.toString(),
      startTime: new Date(`${day1}T08:00:00.000Z`),
      endTime: new Date(`${day1}T12:00:00.000Z`),
    },
    {
      name: 'Afternoon Keynotes & Panels',
      zone: mainStage._id,
      zoneId: mainStage._id.toString(),
      startTime: new Date(`${day1}T12:00:00.000Z`),
      endTime: new Date(`${day1}T16:00:00.000Z`),
    },
    {
      name: 'Evening Hackathon & Exhibition',
      zone: workshopHall._id,
      zoneId: workshopHall._id.toString(),
      startTime: new Date(`${day1}T16:00:00.000Z`),
      endTime: new Date(`${day1}T20:00:00.000Z`),
    },
    {
      name: 'Night Wrap-up & Teardown',
      zone: exitGate._id,
      zoneId: exitGate._id.toString(),
      startTime: new Date(`${day1}T20:00:00.000Z`),
      endTime: new Date(`${day1}T23:00:00.000Z`),
    },
    {
      name: 'Parking & Logistics Control',
      zone: parkingZone._id,
      zoneId: parkingZone._id.toString(),
      startTime: new Date(`${day2}T07:00:00.000Z`),
      endTime: new Date(`${day2}T13:00:00.000Z`),
    },
    {
      name: 'Day Emergency Medical Standby',
      zone: firstAidCenter._id,
      zoneId: firstAidCenter._id.toString(),
      startTime: new Date(`${day2}T08:00:00.000Z`),
      endTime: new Date(`${day2}T16:00:00.000Z`),
    },
    {
      name: 'VIP Delegate Reception',
      zone: vipLounge._id,
      zoneId: vipLounge._id.toString(),
      startTime: new Date(`${day2}T08:30:00.000Z`),
      endTime: new Date(`${day2}T14:30:00.000Z`),
    },
    {
      name: 'Main Stage AV Production',
      zone: mainStage._id,
      zoneId: mainStage._id.toString(),
      startTime: new Date(`${day2}T10:00:00.000Z`),
      endTime: new Date(`${day2}T18:00:00.000Z`),
    },
    {
      name: 'Food Court Peak Service',
      zone: foodCourt._id,
      zoneId: foodCourt._id.toString(),
      startTime: new Date(`${day2}T11:30:00.000Z`),
      endTime: new Date(`${day2}T15:30:00.000Z`),
    },
    {
      name: 'Night Emergency Medical Standby',
      zone: firstAidCenter._id,
      zoneId: firstAidCenter._id.toString(),
      startTime: new Date(`${day2}T16:00:00.000Z`),
      endTime: new Date(`${day2}T23:00:00.000Z`),
    },
  ];

  const shifts = await Shift.insertMany(
    shiftsData.map((s) => ({
      ...s,
      event: heroEvent._id,
      eventId,
    }))
  );

  const [
    shiftMorning,
    shiftAfternoon,
    shiftEvening,
    shiftNight,
    shiftVip,
    shiftStage,
    shiftMedDay,
    shiftMedNight,
    shiftFoodPeak,
    shiftParking,
  ] = shifts;

  // 3. CREATE 12 OPERATIONAL ROLES
  const rolesData = [
    {
      name: 'Crowd Marshal',
      zone: mainEntrance._id,
      zoneId: mainEntrance._id.toString(),
      shift: shiftMorning._id,
      shiftId: shiftMorning._id.toString(),
      description: 'Manage attendee flow, queues at entry turnstiles, and safety barricades',
      requiredSkills: ['crowd-control', 'communication', 'conflict-management'],
      capacity: 12,
      requiredCount: 12,
      priority: 'High',
    },
    {
      name: 'Registration Executive',
      zone: registrationArea._id,
      zoneId: registrationArea._id.toString(),
      shift: shiftMorning._id,
      shiftId: shiftMorning._id.toString(),
      description: 'Scan delegate QR codes, verify government IDs, and print RFID badges',
      requiredSkills: ['registration', 'communication', 'organization'],
      capacity: 10,
      requiredCount: 10,
      priority: 'Medium',
    },
    {
      name: 'Help Desk Executive',
      zone: helpDesk._id,
      zoneId: helpDesk._id.toString(),
      shift: shiftAfternoon._id,
      shiftId: shiftAfternoon._id.toString(),
      description: 'Provide campus navigation, resolve badge issues, and maintain lost property log',
      requiredSkills: ['customer-service', 'communication', 'navigation'],
      capacity: 6,
      requiredCount: 6,
      priority: 'Low',
    },
    {
      name: 'Security Support',
      zone: mainEntrance._id,
      zoneId: mainEntrance._id.toString(),
      shift: shiftMorning._id,
      shiftId: shiftMorning._id.toString(),
      description: 'Assist security agency with bag checks and credential enforcement',
      requiredSkills: ['crowd-control', 'conflict-management', 'emergency-response'],
      capacity: 8,
      requiredCount: 8,
      priority: 'High',
    },
    {
      name: 'First Aid Assistant',
      zone: firstAidCenter._id,
      zoneId: firstAidCenter._id.toString(),
      shift: shiftMedDay._id,
      shiftId: shiftMedDay._id.toString(),
      description: 'Provide basic wound dressing, CPR standby, and assist attending medical officers',
      requiredSkills: ['first-aid', 'emergency-response', 'cpr'],
      capacity: 4,
      requiredCount: 4,
      priority: 'High',
    },
    {
      name: 'Parking Coordinator',
      zone: parkingZone._id,
      zoneId: parkingZone._id.toString(),
      shift: shiftParking._id,
      shiftId: shiftParking._id.toString(),
      description: 'Direct vehicles into designated basement slots and maintain clear emergency lanes',
      requiredSkills: ['parking-management', 'traffic-direction', 'communication'],
      capacity: 8,
      requiredCount: 8,
      priority: 'Medium',
    },
    {
      name: 'Stage Support',
      zone: mainStage._id,
      zoneId: mainStage._id.toString(),
      shift: shiftStage._id,
      shiftId: shiftStage._id.toString(),
      description: 'Coordinate keynote speakers, cue wireless lapel microphones, and assist AV team',
      requiredSkills: ['technical-support', 'stage-coordination', 'communication'],
      capacity: 6,
      requiredCount: 6,
      priority: 'High',
    },
    {
      name: 'Workshop Coordinator',
      zone: workshopHall._id,
      zoneId: workshopHall._id.toString(),
      shift: shiftEvening._id,
      shiftId: shiftEvening._id.toString(),
      description: 'Distribute lab hardware kits, verify session ticketing, and assist instructors',
      requiredSkills: ['organization', 'technical-support', 'communication'],
      capacity: 6,
      requiredCount: 6,
      priority: 'Medium',
    },
    {
      name: 'Food Court Coordinator',
      zone: foodCourt._id,
      zoneId: foodCourt._id.toString(),
      shift: shiftFoodPeak._id,
      shiftId: shiftFoodPeak._id.toString(),
      description: 'Oversee buffet line movement, coordinate tray clearing, and water refill points',
      requiredSkills: ['hospitality', 'crowd-control', 'hygiene-management'],
      capacity: 6,
      requiredCount: 6,
      priority: 'Low',
    },
    {
      name: 'VIP Support Officer',
      zone: vipLounge._id,
      zoneId: vipLounge._id.toString(),
      shift: shiftVip._id,
      shiftId: shiftVip._id.toString(),
      description: 'Greet international speakers, manage lounge security access, and coordinate escorts',
      requiredSkills: ['hospitality', 'communication', 'protocol-handling'],
      capacity: 4,
      requiredCount: 4,
      priority: 'High',
    },
    {
      name: 'Queue Manager',
      zone: registrationArea._id,
      zoneId: registrationArea._id.toString(),
      shift: shiftMorning._id,
      shiftId: shiftMorning._id.toString(),
      description: 'Guide attendees into fastest available counters and manage priority express lanes',
      requiredSkills: ['queue-management', 'communication', 'patience'],
      capacity: 6,
      requiredCount: 6,
      priority: 'Medium',
    },
    {
      name: 'Emergency Response Volunteer',
      zone: firstAidCenter._id,
      zoneId: firstAidCenter._id.toString(),
      shift: shiftMedNight._id,
      shiftId: shiftMedNight._id.toString(),
      description: 'Rapid response volunteer stationed for immediate incident reporting and evacuation',
      requiredSkills: ['emergency-response', 'first-aid', 'leadership'],
      capacity: 4,
      requiredCount: 4,
      priority: 'High',
    },
  ];

  const roles = await Role.insertMany(
    rolesData.map((r) => ({
      ...r,
      event: heroEvent._id,
      eventId,
    }))
  );

  const [
    roleCrowdMarshal,
    roleRegistration,
    roleHelpDesk,
    roleSecurity,
    roleFirstAid,
    roleParking,
    roleStageSupport,
    roleWorkshop,
    roleFoodCourt,
    roleVIPSupport,
    roleQueueManager,
    roleEmergency,
  ] = roles;

  // 4. CREATE 50 ASSIGNMENTS WITH MIXED OPERATIONAL STATES
  // Checked-in (18), Assigned (16), Completed (10), Dropped (4), Cancelled (2) = 50 total
  // Also carefully calibrate Zone Risk profiles:
  // - Registration Area: 9 / 10 filled -> LOW RISK
  // - Food Court: 4 / 6 filled -> MEDIUM RISK
  // - Parking Zone: 2 / 8 filled -> HIGH RISK (6 vacancies)
  // - Exit Gate: 2 / 8 filled -> HIGH RISK
  // - First Aid Center: 2 / 4 filled (critical role with scarce backup) -> HIGH RISK

  const v = (idx) => volunteers[idx];

  const assignmentsPlan = [
    // --- Registration Area (9 filled -> 8 checked_in, 1 assigned; 1 completed earlier) ---
    // Total filled: 9 / 10 -> LOW RISK
    { vol: v(1), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -180, hrs: 3.5 },
    { vol: v(3), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -190, hrs: 3.5 },
    { vol: v(9), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -175, hrs: 3.2 },
    { vol: v(16), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -185, hrs: 3.3 },
    { vol: v(19), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -170, hrs: 3.0 },
    { vol: v(25), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -160, hrs: 2.8 },
    { vol: v(31), role: roleRegistration, shift: shiftMorning, status: 'checked_in', inOffset: -150, hrs: 2.5 },
    { vol: v(40), role: roleQueueManager, shift: shiftMorning, status: 'checked_in', inOffset: -180, hrs: 3.5 },
    { vol: v(42), role: roleQueueManager, shift: shiftMorning, status: 'assigned' },

    // --- Main Entrance (6 filled / 12 required) ---
    // Rohan Desai (v(2)) is assigned here -> Easy replacement target!
    { vol: v(0), role: roleCrowdMarshal, shift: shiftMorning, status: 'checked_in', inOffset: -200, hrs: 3.8 },
    { vol: v(2), role: roleCrowdMarshal, shift: shiftMorning, status: 'assigned' }, // <-- Rohan Desai (Key Dropout / Replacement Scenario)
    { vol: v(4), role: roleCrowdMarshal, shift: shiftMorning, status: 'checked_in', inOffset: -195, hrs: 3.6 },
    { vol: v(8), role: roleCrowdMarshal, shift: shiftMorning, status: 'checked_in', inOffset: -190, hrs: 3.5 },
    { vol: v(18), role: roleCrowdMarshal, shift: shiftMorning, status: 'assigned' },
    { vol: v(29), role: roleSecurity, shift: shiftMorning, status: 'checked_in', inOffset: -210, hrs: 4.0 },

    // --- First Aid Center (2 filled / 4 required) ---
    // Dr. Suresh Raman (v(46)) assigned here -> Scarce replacement target!
    { vol: v(46), role: roleFirstAid, shift: shiftMedDay, status: 'checked_in', inOffset: -220, hrs: 4.2 }, // Dr. Suresh Raman
    { vol: v(47), role: roleFirstAid, shift: shiftMedDay, status: 'assigned' }, // Sunita Rao

    // --- Food Court (4 filled / 6 required -> MEDIUM RISK) ---
    { vol: v(14), role: roleFoodCourt, shift: shiftFoodPeak, status: 'assigned' },
    { vol: v(23), role: roleFoodCourt, shift: shiftFoodPeak, status: 'checked_in', inOffset: -60, hrs: 1.0 },
    { vol: v(35), role: roleFoodCourt, shift: shiftFoodPeak, status: 'assigned' },
    { vol: v(37), role: roleFoodCourt, shift: shiftFoodPeak, status: 'checked_in', inOffset: -50, hrs: 0.8 },

    // --- Workshop Hall (4 filled / 6 required -> MEDIUM RISK) ---
    { vol: v(7), role: roleWorkshop, shift: shiftEvening, status: 'assigned' },
    { vol: v(22), role: roleWorkshop, shift: shiftEvening, status: 'assigned' },
    { vol: v(36), role: roleWorkshop, shift: shiftEvening, status: 'assigned' },
    { vol: v(52), role: roleWorkshop, shift: shiftEvening, status: 'assigned' },

    // --- Main Stage (5 filled / 6 required) ---
    { vol: v(10), role: roleStageSupport, shift: shiftStage, status: 'checked_in', inOffset: -90, hrs: 1.5 },
    { vol: v(50), role: roleStageSupport, shift: shiftStage, status: 'checked_in', inOffset: -85, hrs: 1.4 },
    { vol: v(51), role: roleStageSupport, shift: shiftStage, status: 'assigned' },
    { vol: v(53), role: roleStageSupport, shift: shiftStage, status: 'assigned' },
    { vol: v(34), role: roleStageSupport, shift: shiftStage, status: 'checked_in', inOffset: -80, hrs: 1.3 },

    // --- VIP Lounge (3 filled / 4 required) ---
    { vol: v(11), role: roleVIPSupport, shift: shiftVip, status: 'checked_in', inOffset: -180, hrs: 3.0 },
    { vol: v(54), role: roleVIPSupport, shift: shiftVip, status: 'checked_in', inOffset: -170, hrs: 2.8 },
    { vol: v(55), role: roleVIPSupport, shift: shiftVip, status: 'assigned' },

    // --- Central Help Desk (4 filled / 6 required) ---
    { vol: v(5), role: roleHelpDesk, shift: shiftAfternoon, status: 'assigned' },
    { vol: v(13), role: roleHelpDesk, shift: shiftAfternoon, status: 'assigned' },
    { vol: v(21), role: roleHelpDesk, shift: shiftAfternoon, status: 'assigned' },
    { vol: v(33), role: roleHelpDesk, shift: shiftAfternoon, status: 'assigned' },

    // --- Parking Zone (2 filled / 8 required -> HIGH RISK, large deficit) ---
    { vol: v(6), role: roleParking, shift: shiftParking, status: 'checked_in', inOffset: -210, hrs: 4.0 },
    { vol: v(17), role: roleParking, shift: shiftParking, status: 'assigned' },

    // --- Completed Early Shift Assignments (10 Completed) ---
    { vol: v(20), role: roleQueueManager, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(24), role: roleRegistration, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(26), role: roleCrowdMarshal, shift: shiftMorning, status: 'completed', inOffset: -310, outOffset: -70, hrs: 4.0 },
    { vol: v(27), role: roleRegistration, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(28), role: roleVIPSupport, shift: shiftVip, status: 'completed', inOffset: -320, outOffset: -80, hrs: 4.0 },
    { vol: v(30), role: roleSecurity, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(32), role: roleCrowdMarshal, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(38), role: roleHelpDesk, shift: shiftMorning, status: 'completed', inOffset: -290, outOffset: -50, hrs: 4.0 },
    { vol: v(39), role: roleQueueManager, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },
    { vol: v(41), role: roleRegistration, shift: shiftMorning, status: 'completed', inOffset: -300, outOffset: -60, hrs: 4.0 },

    // --- Deliberate Dropouts (4 Dropped) ---
    // Group E Dropouts
    { vol: v(64), role: roleVIPSupport, shift: shiftVip, status: 'dropped', inOffset: -240, hrs: 0.5 }, // Vijay Mallya
    { vol: v(65), role: roleRegistration, shift: shiftMorning, status: 'dropped' }, // Nirav Modi
    { vol: v(66), role: roleCrowdMarshal, shift: shiftMorning, status: 'dropped' }, // Harshad Mehta
    { vol: v(68), role: roleParking, shift: shiftParking, status: 'dropped' }, // Ketan Parekh

    // --- Cancelled Assignments (2 Cancelled) ---
    { vol: v(70), role: roleHelpDesk, shift: shiftAfternoon, status: 'cancelled' }, // Mehul Choksi
    { vol: v(71), role: roleFoodCourt, shift: shiftFoodPeak, status: 'cancelled' }, // Ramalinga Raju
  ];

  const now = new Date();
  const createdAssignments = [];

  for (const item of assignmentsPlan) {
    const vol = item.vol;
    if (!vol) continue;

    const checkedInAt = item.inOffset ? new Date(now.getTime() + item.inOffset * 60000) : null;
    const checkedOutAt = item.outOffset ? new Date(now.getTime() + item.outOffset * 60000) : null;

    const assign = await Assignment.create({
      event: heroEvent._id,
      eventId,
      volunteer: vol._id,
      volunteerId: vol._id.toString(),
      shift: item.shift._id,
      shiftId: item.shift._id.toString(),
      role: item.role._id,
      roleId: item.role._id.toString(),
      status: item.status,
      assignedAt: new Date(now.getTime() - 24 * 3600000), // Assigned yesterday
      checkedInAt,
      checkedOutAt,
      hoursWorked: item.hrs || 0,
    });

    createdAssignments.push(assign);
  }

  // 5. CREATE 30 REALISTIC TASKS
  // Statuses: Open (10), In Progress (10), Resolved (10)
  // Priorities: Low (8), Medium (14), High (8)
  const tasksData = [
    // Resolved tasks (Morning preparations)
    {
      title: 'Set up registration counters and thermal badge printers',
      zoneId: registrationArea._id.toString(),
      description: 'Unbox 10 badge printers, connect to high-speed LAN switches, and verify card stock.',
      priority: 'High',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[1]._id.toString(),
    },
    {
      title: 'Install primary entrance stanchions and signage',
      zoneId: mainEntrance._id.toString(),
      description: 'Mount metal queue guidance ribbons and directional signs for General vs VIP gates.',
      priority: 'Medium',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[0]._id.toString(),
    },
    {
      title: 'Test stage wireless microphones and audio loop',
      zoneId: mainStage._id.toString(),
      description: 'Conduct soundcheck on 6 handheld mics, 4 lapels, and auditorium line array.',
      priority: 'High',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[10]._id.toString(),
    },
    {
      title: 'Inspect emergency exit doors and crash bars',
      zoneId: exitGate._id.toString(),
      description: 'Verify all 8 double-door egress pathways open smoothly without obstruction.',
      priority: 'High',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[29]._id.toString(),
    },
    {
      title: 'Stock First Aid clinic with trauma supplies and AED unit',
      zoneId: firstAidCenter._id.toString(),
      description: 'Verify automated external defibrillator charge, ice packs, sterile bandages, and ORS.',
      priority: 'High',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[46]._id.toString(),
    },
    {
      title: 'Distribute lunch meal vouchers to volunteer briefing captains',
      zoneId: foodCourt._id.toString(),
      description: 'Hand over 80 physical barcode coupons to shift leads.',
      priority: 'Low',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[14]._id.toString(),
    },
    {
      title: 'Assemble attendee welcome gift backpacks',
      zoneId: registrationArea._id.toString(),
      description: 'Pack 1500 delegate bags with lanyards, summit notebooks, and sponsor merchandise.',
      priority: 'Medium',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[3]._id.toString(),
    },
    {
      title: 'Test parking boom barriers and QR ticket validators',
      zoneId: parkingZone._id.toString(),
      description: 'Run 20 test gate open cycles with demo parking passes.',
      priority: 'Medium',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[6]._id.toString(),
    },
    {
      title: 'Configure VIP lounge catering and coffee espresso machine',
      zoneId: vipLounge._id.toString(),
      description: 'Check fresh roasted coffee bean hopper, water line pressure, and mineral water bottles.',
      priority: 'Low',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[11]._id.toString(),
    },
    {
      title: 'Verify workshop power extension strips and LAN cables',
      zoneId: workshopHall._id.toString(),
      description: 'Ensure 60 power outlets along workbenches have active ground circuits.',
      priority: 'Medium',
      status: 'Resolved',
      assigneeVolunteerId: volunteers[7]._id.toString(),
    },

    // In Progress tasks (Active operational duties)
    {
      title: 'Manage peak morning entrance queue overflow',
      zoneId: mainEntrance._id.toString(),
      description: 'Direct late arrivals to fast lanes 7-10 to prevent sidewalk congestion.',
      priority: 'High',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[8]._id.toString(),
    },
    {
      title: 'Conduct hourly First Aid perimeter walkaround',
      zoneId: firstAidCenter._id.toString(),
      description: 'Check audience seating zones for signs of heat exhaustion or dehydration.',
      priority: 'Medium',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[47]._id.toString(),
    },
    {
      title: 'Coordinate speaker presentation slide uploads',
      zoneId: mainStage._id.toString(),
      description: 'Collect USB keynotes for afternoon 2 PM session into master presentation laptop.',
      priority: 'High',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[50]._id.toString(),
    },
    {
      title: 'Monitor food court tray return conveyor and sanitation',
      zoneId: foodCourt._id.toString(),
      description: 'Prevent food tray bottleneck near west exit door.',
      priority: 'Medium',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[23]._id.toString(),
    },
    {
      title: 'Log and catalog lost items at Central Help Desk',
      zoneId: helpDesk._id.toString(),
      description: 'Tag found items (sunglasses, badge lanyards, chargers) into digital register.',
      priority: 'Low',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[5]._id.toString(),
    },
    {
      title: 'Assist VIP international speaker delegation transfer',
      zoneId: vipLounge._id.toString(),
      description: 'Coordinate golf cart transfer from VIP lounge to main stage green room.',
      priority: 'High',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[54]._id.toString(),
    },
    {
      title: 'Coordinate basement bus shuttle loading',
      zoneId: parkingZone._id.toString(),
      description: 'Maintain 10-minute departure interval for transit station shuttles.',
      priority: 'Medium',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[17]._id.toString(),
    },
    {
      title: 'Pre-configure developer lab cloud API keys',
      zoneId: workshopHall._id.toString(),
      description: 'Ensure student accounts have sandbox credits loaded before 3 PM hands-on session.',
      priority: 'Medium',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[22]._id.toString(),
    },
    {
      title: 'Monitor registration badge ribbon stock',
      zoneId: registrationArea._id.toString(),
      description: 'Notify supply coordinator when color ribbon cartridges fall below 3 units.',
      priority: 'Low',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[9]._id.toString(),
    },
    {
      title: 'Steward auditorium side door access during keynote speech',
      zoneId: mainStage._id.toString(),
      description: 'Keep heavy fire doors closed to eliminate sound bleed into livestream.',
      priority: 'Medium',
      status: 'In Progress',
      assigneeVolunteerId: volunteers[34]._id.toString(),
    },

    // Open tasks (Upcoming & standing operations)
    {
      title: 'Prepare evening hackathon prize stage podium',
      zoneId: workshopHall._id.toString(),
      description: 'Set up awards banner, trophy table, and secondary wireless mic.',
      priority: 'Medium',
      status: 'Open',
      assigneeVolunteerId: null,
    },
    {
      title: 'Refill drinking water dispensers across all exhibition aisles',
      zoneId: foodCourt._id.toString(),
      description: 'Replace 20-liter water carboys at hydration stations 1 through 8.',
      priority: 'Low',
      status: 'Open',
      assigneeVolunteerId: volunteers[35]._id.toString(),
    },
    {
      title: 'Deploy evening egress crowd control barricades at Gate 4',
      zoneId: exitGate._id.toString(),
      description: 'Set up steel interlocking barricades for 6 PM mass attendee departure.',
      priority: 'High',
      status: 'Open',
      assigneeVolunteerId: null,
    },
    {
      title: 'Audit evening badge scanner battery levels',
      zoneId: registrationArea._id.toString(),
      description: 'Dock handheld QR scanners into charging cradles during 3 PM lull.',
      priority: 'Low',
      status: 'Open',
      assigneeVolunteerId: volunteers[16]._id.toString(),
    },
    {
      title: 'Inspect evening shuttle pickup lighting at East Bay',
      zoneId: parkingZone._id.toString(),
      description: 'Verify high-mast LED floodlights power on at 6:30 PM sunset.',
      priority: 'Medium',
      status: 'Open',
      assigneeVolunteerId: null,
    },
    {
      title: 'Restock emergency glucose packets in First Aid clinic',
      zoneId: firstAidCenter._id.toString(),
      description: 'Procure 3 boxes of fast-acting glucose chews from nearby pharmacy partner.',
      priority: 'Medium',
      status: 'Open',
      assigneeVolunteerId: null,
    },
    {
      title: 'Set up Lost and Found pickup booth for event closing',
      zoneId: helpDesk._id.toString(),
      description: 'Transfer locked valuable bin to front counter for departing delegates.',
      priority: 'Low',
      status: 'Open',
      assigneeVolunteerId: volunteers[13]._id.toString(),
    },
    {
      title: 'Collect feedback survey forms from workshop desks',
      zoneId: workshopHall._id.toString(),
      description: 'Distribute and collect paper rating sheets after AI robotics lab concludes.',
      priority: 'Low',
      status: 'Open',
      assigneeVolunteerId: volunteers[36]._id.toString(),
    },
    {
      title: 'Coordinate security briefing for Day 2 morning VIP convoy',
      zoneId: vipLounge._id.toString(),
      description: 'Liaise with local traffic police inspector regarding tomorrow 8 AM convoy route.',
      priority: 'High',
      status: 'Open',
      assigneeVolunteerId: null,
    },
    {
      title: 'Night facility cleanup and trash segregation pass',
      zoneId: exitGate._id.toString(),
      description: 'Ensure recycling bins are sorted and cardboard waste stacked neatly at loading dock.',
      priority: 'Low',
      status: 'Open',
      assigneeVolunteerId: null,
    },
  ];

  const createdTasks = await Task.insertMany(
    tasksData.map((t) => ({
      ...t,
      eventId,
    }))
  );

  // 6. CREATE 18 INCIDENTS
  // Severities: Low (5), Medium (6), High (5), Critical (2)
  // Statuses: Open (6), Acknowledged (4), Escalated (3), Resolved (5)
  const incidentsData = [
    // Critical incidents (2)
    {
      title: 'Medical Emergency: Severe allergic reaction reported in Food Court',
      zoneId: foodCourt._id.toString(),
      type: 'Medical',
      description: 'Attendee experiencing acute anaphylactic reaction after consuming peanut sauce. Medical team summoned immediately.',
      severity: 'Critical',
      status: 'Escalated',
      assignedCoordinator: 'Dr. Anjali Sawant',
      acknowledgedAt: new Date(now.getTime() - 25 * 60000),
      escalatedAt: new Date(now.getTime() - 15 * 60000),
    },
    {
      title: 'Fire Alarm Strobe triggered near West Electrical Substation',
      zoneId: parkingZone._id.toString(),
      type: 'Safety',
      description: 'Smoke sensor indicator active in utility riser. On-site fire marshals dispatched to inspect.',
      severity: 'Critical',
      status: 'Acknowledged',
      assignedCoordinator: 'Rajesh Kulkarni',
      acknowledgedAt: new Date(now.getTime() - 10 * 60000),
    },

    // High severity incidents (5)
    {
      title: 'Queue Surge at Main Entrance causing sidewalk crush',
      zoneId: mainEntrance._id.toString(),
      type: 'Crowd Flow',
      description: 'Over 800 delegates arrived concurrently due to suburban train arrival. Stanchions bending under crowd weight.',
      severity: 'High',
      status: 'In Progress', // Note: status enum is Open, Acknowledged, Escalated, Resolved
      status: 'Escalated',
      assignedCoordinator: 'Rajesh Kulkarni',
      acknowledgedAt: new Date(now.getTime() - 45 * 60000),
      escalatedAt: new Date(now.getTime() - 30 * 60000),
    },
    {
      title: 'Badge Printer Controller Network Crash at Counter 4-6',
      zoneId: registrationArea._id.toString(),
      type: 'Technical',
      description: 'Print spooler server unreachable on local subnet. Attendees queued over 20 minutes.',
      severity: 'High',
      status: 'Acknowledged',
      assignedCoordinator: 'Sunita Menon',
      acknowledgedAt: new Date(now.getTime() - 35 * 60000),
    },
    {
      title: 'Main Stage Wireless Frequency Interference during Keynote',
      zoneId: mainStage._id.toString(),
      type: 'Technical',
      description: 'RF intermodulation causing crackling audio on Channel 3. Sound engineer re-scanning spectrum.',
      severity: 'High',
      status: 'Open',
      assignedCoordinator: 'Vikram Sengupta',
    },
    {
      title: 'Unauthorized vehicle parked in Ambulance Evacuation Bay',
      zoneId: firstAidCenter._id.toString(),
      type: 'Security',
      description: 'Private SUV blocking rapid paramedic exit path. Tow truck requested.',
      severity: 'High',
      status: 'Resolved',
      assignedCoordinator: 'Harish Nambiar',
      acknowledgedAt: new Date(now.getTime() - 120 * 60000),
      escalatedAt: new Date(now.getTime() - 100 * 60000),
      resolvedAt: new Date(now.getTime() - 70 * 60000),
    },
    {
      title: 'Power Failure on Workshop Hall Phase 2 Circuit Breaker',
      zoneId: workshopHall._id.toString(),
      type: 'Infrastructure',
      description: 'Overload tripped 63A MCB switch during cloud robotics demo session.',
      severity: 'High',
      status: 'Resolved',
      assignedCoordinator: 'Kunal Deshmukh',
      acknowledgedAt: new Date(now.getTime() - 180 * 60000),
      escalatedAt: new Date(now.getTime() - 160 * 60000),
      resolvedAt: new Date(now.getTime() - 110 * 60000),
    },

    // Medium severity incidents (6)
    {
      title: 'Liquid Spill Hazard in Central Food Court Concourse',
      zoneId: foodCourt._id.toString(),
      type: 'Facility',
      description: 'Large soda dispenser spill creating slip risk near buffet queue.',
      severity: 'Medium',
      status: 'Resolved',
      assignedCoordinator: 'Pooja Bhatia',
      acknowledgedAt: new Date(now.getTime() - 80 * 60000),
      resolvedAt: new Date(now.getTime() - 40 * 60000),
    },
    {
      title: 'Lost child reported separated from guardian near Fountain',
      zoneId: helpDesk._id.toString(),
      type: 'Security',
      description: '6-year-old boy in blue shirt escorted to Help Desk. Announcement broadcast.',
      severity: 'Medium',
      status: 'Resolved',
      assignedCoordinator: 'Farhan Qureshi',
      acknowledgedAt: new Date(now.getTime() - 95 * 60000),
      resolvedAt: new Date(now.getTime() - 60 * 60000),
    },
    {
      title: 'Delivery Truck Jackknifed at Basement Parking Ramp',
      zoneId: parkingZone._id.toString(),
      type: 'Logistics',
      description: 'Catering delivery truck blocking inbound ramp B. Traffic diverted to ramp A.',
      severity: 'Medium',
      status: 'Open',
      assignedCoordinator: 'Harish Nambiar',
    },
    {
      title: 'Attendee Badge scanning barcode unscannable',
      zoneId: registrationArea._id.toString(),
      type: 'Operational',
      description: 'Damaged QR code sticker requires manual name lookup and badge reprint.',
      severity: 'Medium',
      status: 'Open',
      assignedCoordinator: 'Sunita Menon',
    },
    {
      title: 'Air conditioning chiller malfunction in Workshop Hall B',
      zoneId: workshopHall._id.toString(),
      type: 'Facility',
      description: 'Room temperature reached 28C. Facility engineering adjusting blower units.',
      severity: 'Medium',
      status: 'Acknowledged',
      assignedCoordinator: 'Kunal Deshmukh',
      acknowledgedAt: new Date(now.getTime() - 20 * 60000),
    },
    {
      title: 'Security radio channel 2 cross-talk from adjacent venue',
      zoneId: mainEntrance._id.toString(),
      type: 'Communication',
      description: 'Intermittent walkie-talkie interference with nearby hotel security frequency.',
      severity: 'Medium',
      status: 'Open',
      assignedCoordinator: 'Rajesh Kulkarni',
    },

    // Low severity incidents (5)
    {
      title: 'Lost Apple AirPods case reported at Central Help Desk',
      zoneId: helpDesk._id.toString(),
      type: 'Lost and Found',
      description: 'White AirPods Pro case found on Auditorium Row M Seat 14.',
      severity: 'Low',
      status: 'Open',
      assignedCoordinator: 'Farhan Qureshi',
    },
    {
      title: 'Water dispenser cup shortage at Exit Corridor 3',
      zoneId: exitGate._id.toString(),
      type: 'Supplies',
      description: 'Paper drinking cups depleted; attendees requesting replacements.',
      severity: 'Low',
      status: 'Resolved',
      assignedCoordinator: 'Sameer Verma',
      acknowledgedAt: new Date(now.getTime() - 110 * 60000),
      resolvedAt: new Date(now.getTime() - 90 * 60000),
    },
    {
      title: 'Signage banner detached at Workshop Hall Entrance',
      zoneId: workshopHall._id.toString(),
      type: 'Facility',
      description: 'Top grommet snapped on vinyl sponsor banner; requires zip-tie fixing.',
      severity: 'Low',
      status: 'Open',
      assignedCoordinator: 'Kunal Deshmukh',
    },
    {
      title: 'Delegate badge lanyard clip snapped',
      zoneId: registrationArea._id.toString(),
      type: 'Supplies',
      description: 'Replacement metal swivel lanyard issued to attendee.',
      severity: 'Low',
      status: 'Acknowledged',
      assignedCoordinator: 'Sunita Menon',
      acknowledgedAt: new Date(now.getTime() - 15 * 60000),
    },
    {
      title: 'VIP speaker car permit sticker missing on arrival',
      zoneId: vipLounge._id.toString(),
      type: 'Protocol',
      description: 'Speaker car cleared manually at gate following coordinator phone confirmation.',
      severity: 'Low',
      status: 'Escalated',
      assignedCoordinator: 'Kavita Chawla',
      acknowledgedAt: new Date(now.getTime() - 50 * 60000),
      escalatedAt: new Date(now.getTime() - 40 * 60000),
    },
  ];

  const createdIncidents = await Incident.insertMany(
    incidentsData.map((inc) => ({
      ...inc,
      eventId,
    }))
  );

  // 7. CREATE 12 ANNOUNCEMENTS
  // Priority: Normal (8), Urgent (4)
  // Audience: Everyone (6), Zone (4), Role (2)
  // Status: Published (10), Draft (2)
  const announcementsData = [
    {
      title: 'Morning Operational All-Hands Briefing Complete',
      message: 'All volunteers and zone leads please ensure your handheld radios are on Channel 1 for general ops. Shift begins immediately.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Published',
      createdBy: 'Rajesh Kulkarni (Lead Coordinator)',
    },
    {
      title: 'URGENT: Main Entrance Ingress Surge Protocol Activated',
      message: 'Crowd Marshals and Security Volunteers at Main Entrance: please open auxiliary turnstile gates 7 through 10 immediately.',
      priority: 'Urgent',
      audience: 'Zone',
      zoneId: mainEntrance._id.toString(),
      status: 'Published',
      createdBy: 'Rajesh Kulkarni (Lead Coordinator)',
    },
    {
      title: 'First Aid Radio Protocol & Emergency Priority Channel',
      message: 'Medical volunteers and First Aid assistants must keep Channel 4 open at all times for urgent medical dispatch requests.',
      priority: 'Urgent',
      audience: 'Role',
      roleId: roleFirstAid._id.toString(),
      status: 'Published',
      createdBy: 'Dr. Anjali Sawant (Medical Director)',
    },
    {
      title: 'Volunteer Lunch Rotation - Batch A (12:00 PM)',
      message: 'Volunteers assigned to Batch A lunch please hand over duties to buddy coordinators and report to Level 2 Volunteer Lounge.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Published',
      createdBy: 'Pooja Bhatia (Logistics)',
    },
    {
      title: 'Keynote Auditorium Doors Opening in 15 Minutes',
      message: 'Main Stage and Queue Marshals: please begin admitting attendees into Main Stage Hall. VIP passholders have priority via Door 1.',
      priority: 'Normal',
      audience: 'Zone',
      zoneId: mainStage._id.toString(),
      status: 'Published',
      createdBy: 'Vikram Sengupta (Stage Director)',
    },
    {
      title: 'URGENT: Basement Parking Ramp A Closed for 20 Minutes',
      message: 'Parking coordinators: Divert all inbound passenger vehicles to Ramp C due to an unloading delivery truck on Ramp A.',
      priority: 'Urgent',
      audience: 'Zone',
      zoneId: parkingZone._id.toString(),
      status: 'Published',
      createdBy: 'Harish Nambiar (Parking Lead)',
    },
    {
      title: 'WiFi Credentials for Hackathon & Lab Workstations',
      message: 'Workshop coordinators: Hackathon SSID is PULSE-LABS-5G with passcode DevSummit2026. Please share only with ticketed lab attendees.',
      priority: 'Normal',
      audience: 'Zone',
      zoneId: workshopHall._id.toString(),
      status: 'Published',
      createdBy: 'Kunal Deshmukh (Tech Lead)',
    },
    {
      title: 'Lost Property Procedure Reminder',
      message: 'All found items must be immediately transported to Central Help Desk on Ground Floor. Do not retain items at individual booths.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Published',
      createdBy: 'Farhan Qureshi (Help Desk Lead)',
    },
    {
      title: 'VIP Ministerial Delegation Arrival Staging at 2:00 PM',
      message: 'VIP Support Officers please ensure East Porte-Cochère is clear of unauthorized personnel between 1:45 PM and 2:15 PM.',
      priority: 'Urgent',
      audience: 'Role',
      roleId: roleVIPSupport._id.toString(),
      status: 'Published',
      createdBy: 'Kavita Chawla (VIP Protocol)',
    },
    {
      title: 'Evening Egress Guidance - Post-Keynote Crowd Flow',
      message: 'Exit Gate marshals please ensure exterior lighting is active and rideshare bay directional boards are visible.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Published',
      createdBy: 'Sameer Verma (Transit Lead)',
    },
    {
      title: 'DRAFT: Day 2 Morning Breakfast & Briefing Schedule',
      message: 'Day 2 briefing will commence at 7:00 AM sharp at Staff Dining Hall. Breakfast will be served starting 6:30 AM.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Draft',
      createdBy: 'Rajesh Kulkarni',
    },
    {
      title: 'DRAFT: Lost and Found Unclaimed Items Courier Notice',
      message: 'Unclaimed personal belongings after 10 PM will be transferred to Mumbai City Police Bandra Kurla post.',
      priority: 'Normal',
      audience: 'Everyone',
      status: 'Draft',
      createdBy: 'Farhan Qureshi',
    },
  ];

  const createdAnnouncements = await Announcement.insertMany(
    announcementsData.map((a) => ({
      ...a,
      eventId,
    }))
  );

  // 8. CREATE 65 CHRONOLOGICALLY ORDERED AUDIT / ACTIVITY RECORDS
  // Spanning over the last 36 hours leading to live command center execution
  const activitiesData = [];
  const addAct = (minutesAgo, type, message, entityType = null, entityId = null, metadata = {}) => {
    activitiesData.push({
      eventId,
      type,
      message,
      entityType,
      entityId,
      metadata,
      createdAt: new Date(now.getTime() - minutesAgo * 60000),
    });
  };

  // Day -1 (Setup & Initial Allocation)
  addAct(2160, 'event_created', 'Event "PULSE Tech Summit 2026" created and published by Super Admin', 'Event', eventId);
  addAct(2100, 'zone_created', '10 operational zones established across Jio World Convention Centre', 'Zone', mainEntrance._id.toString());
  addAct(2040, 'shift_created', 'Operational shift schedules configured (Morning, Afternoon, Evening, Night)', 'Shift', shiftMorning._id.toString());
  addAct(1980, 'role_created', '12 specialized volunteer roles defined with skill prerequisites', 'Role', roleCrowdMarshal._id.toString());
  addAct(1920, 'volunteer_pool_onboarded', '72 volunteer profiles verified and approved into summit roster', 'Volunteer');
  addAct(1800, 'batch_assignment', 'Initial allocation of 50 volunteer assignments dispatched via PULSE', 'Assignment');
  addAct(1740, 'announcement_published', 'Published: "Morning Operational All-Hands Briefing Complete"', 'Announcement');

  // Day 0 Morning (Check-in & Ingress)
  addAct(360, 'volunteer_checked_in', 'Aarav Mehta checked in for Morning Setup & Ingress at Main Entrance', 'Volunteer', volunteers[0]._id.toString());
  addAct(355, 'volunteer_checked_in', 'Priya Shah checked in for Registration Area shift', 'Volunteer', volunteers[1]._id.toString());
  addAct(350, 'volunteer_checked_in', 'Dev Patel checked in for Parking & Logistics Control', 'Volunteer', volunteers[6]._id.toString());
  addAct(345, 'task_created', 'Task created: "Set up registration counters and thermal badge printers"', 'Task');
  addAct(340, 'task_status_changed', 'Task resolved: "Set up registration counters and thermal badge printers"', 'Task');
  addAct(330, 'volunteer_checked_in', 'Dr. Suresh Raman checked in for Day Emergency Medical Standby', 'Volunteer', volunteers[46]._id.toString());
  addAct(320, 'incident_reported', 'Incident reported: "Water dispenser cup shortage at Exit Corridor 3"', 'Incident');
  addAct(310, 'incident_resolved', 'Incident resolved: "Water dispenser cup shortage at Exit Corridor 3"', 'Incident');
  addAct(300, 'task_created', 'Task created: "Install primary entrance stanchions and signage"', 'Task');
  addAct(290, 'task_status_changed', 'Task resolved: "Install primary entrance stanchions and signage"', 'Task');

  // Peak Ingress Rush & Incident Handling
  addAct(240, 'volunteer_dropout', 'Vijay Mallya abandoned shift in VIP Lounge without notice', 'Volunteer', volunteers[64]._id.toString(), { reason: 'No show after initial coffee setup' });
  addAct(235, 'assignment_dropped', 'Assignment marked dropped for volunteer Vijay Mallya', 'Assignment');
  addAct(230, 'replacement_suggested', 'Replacement suggestion generated: Natasha Poonawalla recommended for VIP Lounge', 'Volunteer');
  addAct(220, 'incident_reported', 'Incident reported: "Queue Surge at Main Entrance causing sidewalk crush"', 'Incident');
  addAct(215, 'incident_escalated', 'Queue surge incident escalated to Lead Coordinator Rajesh Kulkarni', 'Incident');
  addAct(210, 'announcement_published', 'Published: "URGENT: Main Entrance Ingress Surge Protocol Activated"', 'Announcement');
  addAct(200, 'task_status_changed', 'Task updated to In Progress: "Manage peak morning entrance queue overflow"', 'Task');
  addAct(190, 'volunteer_checked_in', 'Sunita Rao checked in at First Aid Center', 'Volunteer', volunteers[47]._id.toString());
  addAct(180, 'incident_reported', 'Incident reported: "Badge Printer Controller Network Crash at Counter 4-6"', 'Incident');
  addAct(175, 'incident_acknowledged', 'Badge printer network crash acknowledged by Sunita Menon', 'Incident');
  addAct(170, 'task_status_changed', 'Task resolved: "Stock First Aid clinic with trauma supplies and AED unit"', 'Task');
  addAct(160, 'incident_reported', 'Incident reported: "Power Failure on Workshop Hall Phase 2 Circuit Breaker"', 'Incident');
  addAct(150, 'incident_escalated', 'Power failure in Workshop Hall escalated to Facility Engineering', 'Incident');
  addAct(140, 'volunteer_dropout', 'Nirav Modi failed to report for Registration Executive duties', 'Volunteer', volunteers[65]._id.toString());
  addAct(135, 'assignment_dropped', 'Assignment marked dropped for volunteer Nirav Modi', 'Assignment');
  addAct(130, 'incident_resolved', 'Power restored in Workshop Hall; MCB breaker reset complete', 'Incident');
  addAct(120, 'incident_reported', 'Incident reported: "Unauthorized vehicle parked in Ambulance Evacuation Bay"', 'Incident');
  addAct(115, 'task_created', 'Task created: "Coordinate speaker presentation slide uploads"', 'Task');
  addAct(110, 'incident_resolved', 'Unauthorized vehicle towed from Ambulance Bay by security', 'Incident');
  addAct(105, 'announcement_published', 'Published: "Volunteer Lunch Rotation - Batch A (12:00 PM)"', 'Announcement');

  // Midday Operations & Keynotes
  addAct(90, 'volunteer_checked_out', 'Rohan Desai completed morning shift handover', 'Volunteer', volunteers[2]._id.toString());
  addAct(85, 'volunteer_checked_in', 'Siddharth Nair checked in for Main Stage AV Production', 'Volunteer', volunteers[10]._id.toString());
  addAct(80, 'incident_reported', 'Incident reported: "Liquid Spill Hazard in Central Food Court Concourse"', 'Incident');
  addAct(75, 'task_status_changed', 'Task updated to In Progress: "Conduct hourly First Aid perimeter walkaround"', 'Task');
  addAct(70, 'incident_resolved', 'Food court soda spill cleaned and dried by sanitation team', 'Incident');
  addAct(65, 'announcement_published', 'Published: "Keynote Auditorium Doors Opening in 15 Minutes"', 'Announcement');
  addAct(60, 'incident_reported', 'Incident reported: "Lost child reported separated from guardian near Fountain"', 'Incident');
  addAct(55, 'announcement_published', 'Published: "URGENT: Basement Parking Ramp A Closed for 20 Minutes"', 'Announcement');
  addAct(50, 'incident_resolved', 'Lost child safely reunited with parents at Central Help Desk', 'Incident');
  addAct(45, 'task_status_changed', 'Task resolved: "Test stage wireless microphones and audio loop"', 'Task');
  addAct(40, 'volunteer_dropout', 'Harshad Mehta reported sick; assignment marked dropped', 'Volunteer', volunteers[66]._id.toString());
  addAct(35, 'assignment_dropped', 'Main Entrance crowd marshal assignment marked dropped', 'Assignment');
  addAct(30, 'replacement_suggested', 'Replacement candidates generated: 3 eligible marshals found', 'Matching');
  addAct(25, 'incident_reported', 'CRITICAL INCIDENT: Severe allergic reaction in Food Court', 'Incident');
  addAct(20, 'incident_escalated', 'Allergic reaction escalated; paramedic on-site administering EpiPen', 'Incident');
  addAct(15, 'incident_reported', 'Incident reported: "Fire Alarm Strobe triggered near West Electrical Substation"', 'Incident');
  addAct(10, 'incident_acknowledged', 'Electrical fire alarm acknowledged by Rajesh Kulkarni; marshals inspecting', 'Incident');
  addAct(8, 'task_created', 'Task created: "Restock emergency glucose packets in First Aid clinic"', 'Task');
  addAct(5, 'announcement_published', 'Published: "VIP Ministerial Delegation Arrival Staging at 2:00 PM"', 'Announcement');
  addAct(3, 'resilience_evaluated', 'Event resilience evaluation computed: 4 zones robust, 2 zones at high risk', 'Resilience');
  addAct(1, 'system_heartbeat', 'Command Center dashboard refreshed with live operational metrics', 'System');

  // Insert all 65 activity records sorted chronologically
  const createdActivities = await Activity.insertMany(activitiesData);

  return {
    zones,
    shifts,
    roles,
    assignments: createdAssignments,
    tasks: createdTasks,
    incidents: createdIncidents,
    announcements: createdAnnouncements,
    activities: createdActivities,
  };
};
