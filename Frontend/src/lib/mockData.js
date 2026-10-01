export const EVENT_ID = 'event-tsec-techfest';

export const mockEvent = {
  id: EVENT_ID,
  name: 'TSEC TechFest — Main Arena',
  venue: 'Campus Event Grounds',
  status: 'LIVE SIMULATION',
  startDate: '2026-10-01T08:00:00Z',
  endDate: '2026-10-01T22:00:00Z',
  totalAttendeesEstimate: 4500,
  activeZonesCount: 5,
  heroTagline: 'Every zone. Every volunteer. One live command center.',
  heroDescription: 'Coordinate staffing, attendance and live event operations from a single command center.'
};

export const mockDashboard = {
  volunteersRegistered: 16,
  volunteersAssigned: 12,
  checkedIn: 7,
  coverage: {
    filled: 12,
    required: 18,
    percent: 67
  },
  openIncidents: 1,
  criticalIncidents: 1,
  tasks: {
    total: 8,
    completed: 5
  },
  lastUpdated: new Date().toISOString()
};

export const mockZones = [
  {
    id: 'zone-entry',
    name: 'Entry Gate',
    required: 4,
    assigned: 2,
    gaps: 2,
    status: 'critical', // critical, at_risk, healthy, overstaffed
    statusLabel: 'Critical (2 Gaps)',
    coords: { x: 22, y: 32 },
    lead: 'Aarav Shah',
    incidentCount: 1,
    description: 'Main campus security gates & turnstiles check.'
  },
  {
    id: 'zone-reg',
    name: 'Registration',
    required: 4,
    assigned: 3,
    gaps: 1,
    status: 'warning',
    statusLabel: 'At Risk (1 Gap)',
    coords: { x: 78, y: 28 },
    lead: 'Ananya Iyer',
    incidentCount: 0,
    description: 'Attendee badge scanning and kit distribution desk.'
  },
  {
    id: 'zone-stage',
    name: 'Main Stage',
    required: 5,
    assigned: 5,
    gaps: 0,
    status: 'healthy',
    statusLabel: 'Healthy (Optimal)',
    coords: { x: 80, y: 72 },
    lead: 'Mira Desai',
    incidentCount: 0,
    description: 'Auditorium acoustics, speaker green room and lighting support.'
  },
  {
    id: 'zone-parking',
    name: 'Parking',
    required: 3,
    assigned: 4,
    gaps: 0,
    overstaffed: true,
    status: 'info',
    statusLabel: 'Overstaffed (+1)',
    coords: { x: 24, y: 74 },
    lead: 'Arjun Nair',
    incidentCount: 0,
    description: 'North gate vehicular marshaling & shuttle bay.'
  },
  {
    id: 'zone-firstaid',
    name: 'First Aid',
    required: 2,
    assigned: 2,
    gaps: 0,
    status: 'healthy',
    statusLabel: 'Healthy (Ready)',
    coords: { x: 50, y: 88 },
    lead: 'Diya Mehta',
    incidentCount: 0,
    description: 'Emergency response medical tent & ambulance staging area.'
  }
];

export const mockAttentionQueue = [
  {
    id: 'att-1',
    severity: 'critical',
    title: 'Entry Gate requires 2 more volunteers',
    detail: 'Surge at turnstiles causing queue spillover into outer concourse.',
    zone: 'Entry Gate',
    timestamp: '3m ago',
    actionLabel: 'Resolve Coverage',
    route: '/assignments'
  },
  {
    id: 'att-2',
    severity: 'dropout',
    title: 'Registration volunteer dropped from Morning shift',
    detail: 'Karan Malhotra cancelled attendance citing transportation delay.',
    zone: 'Registration',
    timestamp: '14m ago',
    actionLabel: 'Find Replacement',
    route: '/assignments'
  },
  {
    id: 'att-3',
    severity: 'incident',
    title: 'Crowd Surge reported at Entry Gate',
    detail: 'Security dispatch requested 2 extra crowd guide marshals immediately.',
    zone: 'Entry Gate',
    timestamp: '22m ago',
    actionLabel: 'View Live Ops',
    route: '/live-ops'
  },
  {
    id: 'att-4',
    severity: 'warning',
    title: 'Morning Registration coverage below requirement',
    detail: 'Desk 3 unstaffed during peak attendee check-in window (09:00 - 11:00).',
    zone: 'Registration',
    timestamp: '45m ago',
    actionLabel: 'Staffing Plan',
    route: '/assignments'
  }
];

export const mockShifts = [
  {
    id: 'shift-morning',
    name: 'Morning Shift',
    time: '09:00 – 13:00',
    staffed: 12,
    required: 15,
    percent: 80,
    status: 'warning',
    activeNow: true,
    leads: ['Aarav Shah', 'Ananya Iyer']
  },
  {
    id: 'shift-afternoon',
    name: 'Afternoon Shift',
    time: '13:00 – 17:00',
    staffed: 14,
    required: 16,
    percent: 88,
    status: 'healthy',
    activeNow: false,
    leads: ['Rohan Patel', 'Vikram Joshi']
  },
  {
    id: 'shift-evening',
    name: 'Evening Shift',
    time: '17:00 – 21:00',
    staffed: 10,
    required: 14,
    percent: 71,
    status: 'warning',
    activeNow: false,
    leads: ['Mira Desai', 'Sneha Kulkarni']
  }
];

export const mockRecentActivities = [
  {
    id: 'act-1',
    time: '02:12',
    text: 'Aarav Shah checked in at Entry Gate',
    category: 'checkin',
    zone: 'Entry Gate',
    badge: 'Check In'
  },
  {
    id: 'act-2',
    time: '02:08',
    text: 'Registration volunteer marked dropout',
    category: 'dropout',
    zone: 'Registration',
    badge: 'Dropout'
  },
  {
    id: 'act-3',
    time: '02:07',
    text: 'Replacement suggested for Check-in Desk',
    category: 'replacement',
    zone: 'Registration',
    badge: 'Rule Match'
  },
  {
    id: 'act-4',
    time: '01:58',
    text: 'Crowd Surge incident reported',
    category: 'incident',
    zone: 'Entry Gate',
    badge: 'Incident'
  },
  {
    id: 'act-5',
    time: '01:45',
    text: 'Stage Setup task resolved',
    category: 'task',
    zone: 'Main Stage',
    badge: 'Task Done'
  }
];

export const mockVolunteers = [
  {
    id: 'vol-1',
    name: 'Aarav Shah',
    email: 'aarav.shah@tsec.edu',
    phone: '+91 98201 44510',
    avatar: 'AS',
    skills: ['Crowd Management', 'Communication'],
    availableShifts: ['Morning', 'Afternoon'],
    assignedZone: 'Entry Gate',
    assignedRole: 'Queue Support',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Entry Gate',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:52 AM' }
    ],
    notes: 'Experienced senior volunteer. Holds campus radio radio-channel-2.'
  },
  {
    id: 'vol-2',
    name: 'Diya Mehta',
    email: 'diya.mehta@tsec.edu',
    phone: '+91 98334 11209',
    avatar: 'DM',
    skills: ['First Aid', 'Crisis Support'],
    availableShifts: ['Morning'],
    assignedZone: 'First Aid',
    assignedRole: 'First Aid Volunteer',
    hours: 3,
    maxHours: 5,
    status: 'Assigned',
    preferredZone: 'First Aid',
    attendanceHistory: [],
    notes: 'Certified Red Cross basic life support responder.'
  },
  {
    id: 'vol-3',
    name: 'Rohan Patel',
    email: 'rohan.patel@tsec.edu',
    phone: '+91 98192 78345',
    avatar: 'RP',
    skills: ['Registration', 'Communication'],
    availableShifts: ['Afternoon', 'Evening'],
    assignedZone: 'Registration',
    assignedRole: 'Check-in Desk',
    hours: 5,
    maxHours: 8,
    status: 'Available',
    preferredZone: 'Registration',
    attendanceHistory: [],
    notes: 'Fast at QR ticketing check-in software.'
  },
  {
    id: 'vol-4',
    name: 'Mira Desai',
    email: 'mira.desai@tsec.edu',
    phone: '+91 99200 45678',
    avatar: 'MD',
    skills: ['Stage Support', 'Runner'],
    availableShifts: ['Evening'],
    assignedZone: 'Main Stage',
    assignedRole: 'Stage Support',
    hours: 2,
    maxHours: 4,
    status: 'Assigned',
    preferredZone: 'Main Stage',
    attendanceHistory: [],
    notes: 'Coordinates with audio-visual vendors.'
  },
  {
    id: 'vol-5',
    name: 'Kabir Verma',
    email: 'kabir.verma@tsec.edu',
    phone: '+91 98450 12398',
    avatar: 'KV',
    skills: ['Crowd Management', 'Logistics'],
    availableShifts: ['Morning', 'Afternoon'],
    assignedZone: 'Entry Gate',
    assignedRole: 'Crowd Guide',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Entry Gate',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:58 AM' }
    ],
    notes: 'Stationed at outer barricade security check.'
  },
  {
    id: 'vol-6',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@tsec.edu',
    phone: '+91 98210 99432',
    avatar: 'AI',
    skills: ['Registration', 'Help Desk'],
    availableShifts: ['Morning'],
    assignedZone: 'Registration',
    assignedRole: 'Help Desk',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Registration',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:45 AM' }
    ],
    notes: 'Manages VIP and speaker badge issuance.'
  },
  {
    id: 'vol-7',
    name: 'Vikram Joshi',
    email: 'vikram.joshi@tsec.edu',
    phone: '+91 98111 22334',
    avatar: 'VJ',
    skills: ['First Aid', 'Crisis Support'],
    availableShifts: ['Afternoon'],
    assignedZone: 'First Aid',
    assignedRole: 'First Aid Volunteer',
    hours: 4,
    maxHours: 6,
    status: 'Assigned',
    preferredZone: 'First Aid',
    attendanceHistory: [],
    notes: 'Medical team liaison for emergency services.'
  },
  {
    id: 'vol-8',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@tsec.edu',
    phone: '+91 97690 33451',
    avatar: 'SK',
    skills: ['Stage Support', 'Runner'],
    availableShifts: ['Evening'],
    assignedZone: 'Main Stage',
    assignedRole: 'Stage Support',
    hours: 3,
    maxHours: 5,
    status: 'Assigned',
    preferredZone: 'Main Stage',
    attendanceHistory: [],
    notes: 'Manages green room hospitality & stage prop queues.'
  },
  {
    id: 'vol-9',
    name: 'Arjun Nair',
    email: 'arjun.nair@tsec.edu',
    phone: '+91 98700 88991',
    avatar: 'AN',
    skills: ['Parking Logistics', 'Logistics'],
    availableShifts: ['Morning', 'Afternoon'],
    assignedZone: 'Parking',
    assignedRole: 'Parking Guide',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Parking',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:40 AM' }
    ],
    notes: 'Directs college bus and VIP convoy arrivals.'
  },
  {
    id: 'vol-10',
    name: 'Tanvi Rao',
    email: 'tanvi.rao@tsec.edu',
    phone: '+91 98320 66772',
    avatar: 'TR',
    skills: ['Communication', 'Stage Support'],
    availableShifts: ['Afternoon'],
    assignedZone: 'Main Stage',
    assignedRole: 'Runner',
    hours: 5,
    maxHours: 7,
    status: 'Assigned',
    preferredZone: 'Main Stage',
    attendanceHistory: [],
    notes: 'Escorts keynote judges to tech tracks.'
  },
  {
    id: 'vol-11',
    name: 'Siddharth Rao',
    email: 'siddharth.rao@tsec.edu',
    phone: '+91 98205 11993',
    avatar: 'SR',
    skills: ['Parking Logistics', 'Crowd Management'],
    availableShifts: ['Afternoon'],
    assignedZone: 'Parking',
    assignedRole: 'Parking Guide',
    hours: 4,
    maxHours: 6,
    status: 'Assigned',
    preferredZone: 'Parking',
    attendanceHistory: [],
    notes: 'Handles secondary vehicle slot allocation.'
  },
  {
    id: 'vol-12',
    name: 'Pooja Hegde',
    email: 'pooja.hegde@tsec.edu',
    phone: '+91 99304 55112',
    avatar: 'PH',
    skills: ['Registration', 'Communication'],
    availableShifts: ['Morning'],
    assignedZone: 'Registration',
    assignedRole: 'Check-in Desk',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Registration',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:50 AM' }
    ],
    notes: 'On desk 2 scanning entry QR passes.'
  },
  {
    id: 'vol-13',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@tsec.edu',
    phone: '+91 98222 34455',
    avatar: 'KM',
    skills: ['Crowd Management', 'Communication'],
    availableShifts: ['Evening'],
    assignedZone: 'Entry Gate',
    assignedRole: 'Queue Support',
    hours: 3,
    maxHours: 5,
    status: 'Dropout',
    preferredZone: 'Entry Gate',
    attendanceHistory: [
      { shift: 'Morning', status: 'Dropout', timestamp: '08:30 AM' }
    ],
    notes: 'Transit delay caused dropout. Replacement candidate flagged.'
  },
  {
    id: 'vol-14',
    name: 'Riya Sen',
    email: 'riya.sen@tsec.edu',
    phone: '+91 98198 44321',
    avatar: 'RS',
    skills: ['Stage Support', 'Runner'],
    availableShifts: ['Morning'],
    assignedZone: 'Main Stage',
    assignedRole: 'Runner',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Main Stage',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:48 AM' }
    ],
    notes: 'Delivering stage timing cue cards.'
  },
  {
    id: 'vol-15',
    name: 'Devendra Pillai',
    email: 'devendra.pillai@tsec.edu',
    phone: '+91 98765 43210',
    avatar: 'DP',
    skills: ['Logistics', 'Parking Logistics'],
    availableShifts: ['Evening'],
    assignedZone: 'Parking',
    assignedRole: 'Parking Guide',
    hours: 4,
    maxHours: 6,
    status: 'No Show',
    preferredZone: 'Parking',
    attendanceHistory: [],
    notes: 'Did not check in at designated shift call time.'
  },
  {
    id: 'vol-16',
    name: 'Ishita Roy',
    email: 'ishita.roy@tsec.edu',
    phone: '+91 98234 56789',
    avatar: 'IR',
    skills: ['Communication', 'Registration'],
    availableShifts: ['Morning', 'Afternoon'],
    assignedZone: 'Registration',
    assignedRole: 'Check-in Desk',
    hours: 4,
    maxHours: 6,
    status: 'Checked In',
    preferredZone: 'Registration',
    attendanceHistory: [
      { shift: 'Morning', status: 'Checked In', timestamp: '08:55 AM' }
    ],
    notes: 'Oversees student delegate accreditation.'
  }
];

export const mockRoles = [
  { id: 'role-1', zone: 'Entry Gate', title: 'Queue Support', required: 4, assigned: 2 },
  { id: 'role-2', zone: 'Entry Gate', title: 'Crowd Guide', required: 2, assigned: 1 },
  { id: 'role-3', zone: 'Registration', title: 'Check-in Desk', required: 3, assigned: 2 },
  { id: 'role-4', zone: 'Registration', title: 'Help Desk', required: 1, assigned: 1 },
  { id: 'role-5', zone: 'Main Stage', title: 'Stage Support', required: 3, assigned: 3 },
  { id: 'role-6', zone: 'Main Stage', title: 'Runner', required: 2, assigned: 2 },
  { id: 'role-7', zone: 'Parking', title: 'Parking Guide', required: 3, assigned: 4 },
  { id: 'role-8', zone: 'First Aid', title: 'First Aid Volunteer', required: 2, assigned: 2 }
];
