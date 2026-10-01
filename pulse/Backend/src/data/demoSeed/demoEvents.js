import Event from '../../models/Event.js';

export const DEMO_EVENT_NAMES = [
  'PULSE Tech Summit 2026',
  'Mumbai Innovation Expo 2026',
  'PULSE Community Marathon 2026',
  'Mumbai Startup Conclave 2026',
  'FutureTech AI Conference 2026',
  'Mumbai College Fest 2026',
  'Urban Sustainability Forum 2026',
  'India Developer Connect 2026',
  'Mumbai Music & Culture Fest 2026',
  'PULSE Sports Carnival 2026',
];

export const DEMO_EVENTS_DATA = [
  {
    name: 'PULSE Tech Summit 2026',
    status: 'active',
    venue: 'Jio World Convention Centre, BKC, Mumbai',
    expectedAttendance: 8000,
    startTime: new Date('2026-10-01T08:00:00.000Z'),
    endTime: new Date('2026-10-03T20:00:00.000Z'),
    description:
      'Flagship international technology summit bringing together global innovators, tech leaders, enterprise architects, and open-source developers for three days of keynotes, hackathons, and high-impact workshops.',
  },
  {
    name: 'Mumbai Innovation Expo 2026',
    status: 'upcoming',
    venue: 'Bombay Exhibition Centre (NESCO), Goregaon, Mumbai',
    expectedAttendance: 4500,
    startTime: new Date('2026-10-24T09:00:00.000Z'),
    endTime: new Date('2026-10-26T18:00:00.000Z'),
    description:
      'Premier industrial and academic exhibition showcasing cutting-edge engineering prototypes, climate tech, and IoT breakthroughs across Indian universities and research laboratories.',
  },
  {
    name: 'PULSE Community Marathon 2026',
    status: 'completed',
    venue: 'Marine Drive & Bandra-Worli Sea Link, Mumbai',
    expectedAttendance: 3000,
    startTime: new Date('2026-08-15T05:00:00.000Z'),
    endTime: new Date('2026-08-15T12:00:00.000Z'),
    description:
      'Annual civic charity marathon along South Mumbai scenic coastline promoting public fitness, clean air awareness, and grassroots healthcare funding.',
  },
  {
    name: 'Mumbai Startup Conclave 2026',
    status: 'upcoming',
    venue: 'Taj Lands End, Bandra West, Mumbai',
    expectedAttendance: 2500,
    startTime: new Date('2026-11-12T09:30:00.000Z'),
    endTime: new Date('2026-11-13T18:30:00.000Z'),
    description:
      'High-energy venture summit gathering over 300 venture capitalists, angel syndicates, and seed-stage founders for pitch sessions, roundtables, and ecosystem mixers.',
  },
  {
    name: 'FutureTech AI Conference 2026',
    status: 'upcoming',
    venue: 'CIDCO Exhibition & Convention Centre, Vashi, Navi Mumbai',
    expectedAttendance: 6000,
    startTime: new Date('2026-11-20T08:30:00.000Z'),
    endTime: new Date('2026-11-22T19:00:00.000Z'),
    description:
      'Global frontier conference exploring generative artificial intelligence, autonomous robotics, multimodal systems, and responsible AI governance frameworks.',
  },
  {
    name: 'Mumbai College Fest 2026',
    status: 'active',
    venue: 'IIT Bombay Campus, Powai, Mumbai',
    expectedAttendance: 5000,
    startTime: new Date('2026-10-01T09:00:00.000Z'),
    endTime: new Date('2026-10-02T22:00:00.000Z'),
    description:
      'Inter-collegiate mega festival celebrating student talent in robotics, coding sprints, performing arts, design battles, and youth leadership forums.',
  },
  {
    name: 'Urban Sustainability Forum 2026',
    status: 'upcoming',
    venue: 'Nehru Centre Auditorium, Worli, Mumbai',
    expectedAttendance: 1800,
    startTime: new Date('2026-12-05T09:00:00.000Z'),
    endTime: new Date('2026-12-06T17:00:00.000Z'),
    description:
      'Multi-stakeholder summit dedicated to renewable microgrids, municipal waste reduction, urban mobility transit systems, and sustainable architectural design.',
  },
  {
    name: 'India Developer Connect 2026',
    status: 'completed',
    venue: 'The Lalit Mumbai, Sahar Airport Road, Andheri East, Mumbai',
    expectedAttendance: 3500,
    startTime: new Date('2026-09-10T09:00:00.000Z'),
    endTime: new Date('2026-09-11T18:00:00.000Z'),
    description:
      'Two-day hands-on engineering summit connecting core maintainers of cloud-native infrastructure, distributed databases, Kubernetes clusters, and systems programming.',
  },
  {
    name: 'Mumbai Music & Culture Fest 2026',
    status: 'active',
    venue: 'Mahalaxmi Racecourse, Mahalaxmi, Mumbai',
    expectedAttendance: 7500,
    startTime: new Date('2026-10-01T14:00:00.000Z'),
    endTime: new Date('2026-10-03T23:00:00.000Z'),
    description:
      'Grand outdoor celebration featuring fusion concerts, traditional folk artists, live culinary demonstrations, and heritage craft pavilions across three stages.',
  },
  {
    name: 'PULSE Sports Carnival 2026',
    status: 'completed',
    venue: 'Andheri Sports Complex, Andheri West, Mumbai',
    expectedAttendance: 4000,
    startTime: new Date('2026-09-22T07:00:00.000Z'),
    endTime: new Date('2026-09-24T20:00:00.000Z'),
    description:
      'Three-day multi-sport tournament spanning badminton, football, basketball, track events, and para-athletic exhibitions for amateur clubs across Maharashtra.',
  },
];

/**
 * Seed 10 realistic demo events.
 */
export const seedDemoEvents = async () => {
  const events = [];
  for (const data of DEMO_EVENTS_DATA) {
    const event = await Event.create(data);
    events.push(event);
  }
  return events;
};
