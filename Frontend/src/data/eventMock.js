/**
 * PULSE — Active Event Operational Mock Contract
 * Single source of truth for the live landing and operational preview.
 */
export const activeEvent = {
  name: "TECHFEST",
  year: "2026",
  eyebrow: "LIVE EVENT COORDINATION — 2026",
  chapter: "01 — LIVE EVENT",
  venue: "Thadomal Shahani Engineering College",
  city: "Mumbai",
  status: "LIVE",
  statusPill: "EVENT ACTIVE",
  stats: {
    volunteers: 128,
    zones: 6,
    tasks: 34,
    incidents: 3,
  },
  statRows: [
    { id: "volunteers", value: 128, label: "VOLUNTEERS", desc: "Active on roster across all active shifts" },
    { id: "zones",      value: 6,   label: "ACTIVE ZONES", desc: "Monitored crowd and operational sectors" },
    { id: "tasks",      value: 34,  label: "LIVE TASKS", desc: "Dispatched and in-progress on ground" },
    { id: "incidents",  value: 3,   label: "OPEN INCIDENTS", desc: "Active escalations requiring response", isAlert: true },
  ],
  zones: [
    {
      id: "gate",
      name: "ENTRY GATE",
      filled: 18,
      capacity: 20,
      roles: "Crowd Control: 10 · Security Check: 8",
      shiftWindow: "08:00 – 14:00 (Shift A)",
      lead: "Aarav Sharma",
      status: "Shortfall: 2 volunteers needed"
    },
    {
      id: "registration",
      name: "REGISTRATION",
      filled: 12,
      capacity: 12,
      roles: "Badge Print: 6 · Desk Support: 6",
      shiftWindow: "08:30 – 13:30 (Shift A)",
      lead: "Pooja Mehta",
      status: "Fully Staffed"
    },
    {
      id: "stage",
      name: "MAIN STAGE",
      filled: 14,
      capacity: 16,
      roles: "Audio/Visual: 8 · VIP Escort: 6",
      shiftWindow: "09:00 – 16:00 (Shift B)",
      lead: "Rohan Varma",
      status: "Shortfall: 2 volunteers needed"
    },
    {
      id: "food",
      name: "FOOD ZONE",
      filled: 9,
      capacity: 10,
      roles: "Vendor Liaison: 5 · Waste Mgmt: 4",
      shiftWindow: "11:00 – 17:00 (Shift B)",
      lead: "Neha Patel",
      status: "Shortfall: 1 volunteer needed"
    },
    {
      id: "backstage",
      name: "BACKSTAGE",
      filled: 8,
      capacity: 8,
      roles: "Speaker Lounge: 4 · Gear Transit: 4",
      shiftWindow: "09:00 – 18:00 (Shift B)",
      lead: "Devansh Nair",
      status: "Fully Staffed"
    },
  ],
  flow: {
    // Spatial coordinates relative to an 1000x500 SVG canvas
    nodes: [
      { id: "gate",         label: "ENTRY GATE",   x: 140, y: 260, count: 18, capacity: 20, color: "var(--pulse)" },
      { id: "registration", label: "REGISTRATION", x: 380, y: 130, count: 12, capacity: 12, color: "var(--ink)" },
      { id: "stage",        label: "MAIN STAGE",   x: 620, y: 220, count: 14, capacity: 16, color: "var(--pulse)" },
      { id: "food",         label: "FOOD ZONE",    x: 420, y: 390, count: 9,  capacity: 10, color: "var(--pulse)" },
      { id: "backstage",    label: "BACKSTAGE",    x: 860, y: 260, count: 8,  capacity: 8,  color: "var(--ink)" },
    ],
    // Directed curvilinear transit paths
    paths: [
      { id: "p-gate-reg",   from: "gate",         to: "registration", d: "M 140 260 C 220 180, 290 140, 380 130" },
      { id: "p-gate-food",  from: "gate",         to: "food",         d: "M 140 260 C 220 340, 310 390, 420 390" },
      { id: "p-reg-stage",  from: "registration", to: "stage",        d: "M 380 130 C 480 130, 540 180, 620 220" },
      { id: "p-food-stage", from: "food",         to: "stage",        d: "M 420 390 C 510 390, 560 300, 620 220" },
      { id: "p-stage-back", from: "stage",        to: "backstage",    d: "M 620 220 C 700 180, 770 220, 860 260" },
      { id: "p-back-food",  from: "backstage",    to: "food",         d: "M 860 260 C 760 410, 580 430, 420 390" }
    ],
    tokens: 20
  },
  operations: [
    {
      key: "assignments",
      label: "ASSIGNMENTS",
      desc: "Deterministic rule-based matching, real-time conflict prevention, and instant dropout recovery.",
      route: "/assignments",
      live: null,
      metric: "98% FILL RATE"
    },
    {
      key: "tasks",
      label: "TASKS",
      desc: "Live task dispatch, priority routing, on-ground checklists, and verified task resolution.",
      route: "/tasks",
      live: "34 LIVE",
      metric: "34 IN PROGRESS"
    },
    {
      key: "incidents",
      label: "INCIDENTS",
      desc: "Emergency issue routing, medical/security alerts, severity triage, and rapid escalation.",
      route: "/incidents",
      live: "03 OPEN",
      metric: "03 ESCALATED",
      isAlert: true
    },
    {
      key: "announcements",
      label: "ANNOUNCEMENTS",
      desc: "Targeted broadcast channels to specific zones, roles, or all active volunteers simultaneously.",
      route: "/announcements",
      live: null,
      metric: "ALL CHANNELS ACTIVE"
    },
  ],
  tickerItems: [
    "128 VOLUNTEERS ON-GROUND",
    "06 ACTIVE OPERATIONAL ZONES",
    "34 LIVE TASKS IN PROGRESS",
    "03 OPEN ESCALATIONS",
    "GATE 18/20",
    "REGISTRATION 12/12 COMPLETE",
    "MAIN STAGE 14/16",
    "FOOD ZONE 09/10",
    "BACKSTAGE 08/08 COMPLETE",
    "RADIO LINK 142.85 MHZ NOMINAL",
    "TELEMETRY STREAM SYNCHRONIZED"
  ]
};

export default activeEvent;
