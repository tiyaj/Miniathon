# PULSE
## Event Volunteer & Crowd Coordination Platform

**Hackathon build specification · 4 hours · 4 developers · 2 backend + 2 frontend**

> **Product promise**  
> Give event organizers one clear command center to staff every zone, recover from volunteer dropouts, coordinate live tasks, and respond to incidents before small problems become event-wide disruptions.

---

## Document guide

- [01 — Product brief](#01--product-brief)
- [02 — MVP scope](#02--mvp-scope)
- [03 — Experience and visual direction](#03--experience-and-visual-direction)
- [04 — Pages and interface requirements](#04--pages-and-interface-requirements)
- [05 — Core user journeys](#05--core-user-journeys)
- [06 — Team ownership](#06--team-ownership)
- [07 — Backend specification](#07--backend-specification)
- [08 — Frontend specification](#08--frontend-specification)
- [09 — Matching and reassignment logic](#09--matching-and-reassignment-logic)
- [10 — Demo data](#10--demo-data)
- [11 — Four-hour execution plan](#11--four-hour-execution-plan)
- [12 — Performance and integration rules](#12--performance-and-integration-rules)
- [13 — Acceptance checklist](#13--acceptance-checklist)
- [14 — Demo pitch](#14--demo-pitch)

---

# 01 — Product brief

## The problem

Large events—fests, marathons, conferences, and campus events—depend on volunteers distributed across zones and shifts. When coordination happens through spreadsheets and chat groups, organizers struggle with:

- Uncovered roles and understaffed zones
- Double-booked volunteers and unfair workloads
- Last-minute dropouts with no clear replacement process
- Poor visibility into check-ins, tasks, and on-ground issues
- Important incidents getting lost in chat threads

## The solution

**PULSE** centralizes volunteer scheduling and event operations. Organizers can define zones and roles, match volunteers to shifts, monitor coverage, track attendance, manage tasks, broadcast announcements, and route urgent incidents.

## Product principles

1. **Visibility first:** show gaps, attendance, and urgent issues immediately.
2. **Explainable matching:** show why a volunteer is recommended.
3. **Human-confirmed actions:** suggestions never silently move or assign people.
4. **One connected workflow:** a dropout should update assignments, coverage, and activity.
5. **Demo-ready by default:** seeded data makes the product useful on first launch.

---

# 02 — MVP scope

## What must work in the demo

| Capability | Minimum successful behavior |
|---|---|
| Event setup | Event, zones, shifts, roles, skills, and required headcount are visible and editable at a basic level |
| Volunteer profiles | Create/view volunteers with skills, availability, preference, and status |
| Shift assignment | Assign an eligible volunteer to a role and shift |
| Conflict prevention | Reject overlapping shifts and invalid assignments |
| Coverage | Show required, assigned, and unfilled slots by zone and shift |
| Dropout recovery | Mark a volunteer as dropped out, receive replacement suggestions, confirm a replacement, and see coverage update |
| Attendance | Check in/out and calculate contributed hours |
| Task board | Create tasks and move them through Open, In Progress, and Resolved |
| Incidents | Report, route, acknowledge, escalate, and resolve an issue |
| Announcements | Compose a message for everyone, a zone, or a role; record it as sent in demo mode |
| Dashboard | Show staffing, attendance, tasks, open incidents, and recent activity |

## Simulate instead of integrating

For a four-hour build, these features should be represented with clear demo behavior rather than real external integrations:

- WhatsApp, SMS, email, or push delivery
- QR-code scanning
- GPS or live crowd sensors
- Real-time venue maps
- Authentication and multi-organization permissions
- AI-based optimization

## Explicitly out of scope

Do not spend the sprint on microservices, a complex optimization solver, production notification infrastructure, elaborate role permissions, or live map APIs.

### Definition of done

- The core screens are navigable and use a shared data model.
- The app opens with populated demo data—not an empty dashboard.
- The dropout → replacement → coverage update workflow works end-to-end.
- The incident → acknowledge → resolve workflow works end-to-end.
- The assignment API prevents double-booking.
- Data-driven panels have loading, empty, and error states.
- The UI works at desktop and mobile widths.
- The app remains responsive during interactions; no aggressive polling or heavy animation loops.

---

# 03 — Experience and visual direction

## Creative direction: “Event energy, operations clarity”

Build a polished event command center—not a generic admin template.

**Visual reference direction:** use the supplied Liquid Ink and Drool Community sites as inspiration for immersive scroll-led storytelling, expressive typography, layered visual composition, and tactile transitions. Adapt those ideas to an operations interface: clarity and speed always take priority over spectacle. Do not copy their layouts or assets.

### Suggested design system

| Element | Direction |
|---|---|
| Base | Deep ink/navy background |
| Surfaces | Raised slate panels with subtle borders |
| Primary accent | Electric violet or cobalt |
| Status colors | Mint/teal = healthy, amber = warning, coral/red = critical |
| Typography | Expressive display face for major headings; highly readable sans-serif for data |
| Cards | 14–20px radius, restrained shadow, consistent spacing |
| Layout | Strong grid, generous whitespace, compact operational details |
| Icons | Consistent line icons; avoid mixing icon styles |

Use system fonts if external font loading could delay the build.

## Motion direction

Use motion to explain hierarchy, feedback, and state—not as decoration.

- Hero/title: short staggered reveal on first load
- Section entrances: modest fade/translate when entering view
- Cards: subtle 2–4px hover lift
- Coverage bars: animate once on first render or when values change
- Assignment changes: briefly highlight the updated row/card
- New incident/task: toast plus a restrained insertion transition
- Tabs and filters: 150–220ms transitions

**Accessibility:** respect `prefers-reduced-motion`; disable parallax and nonessential animation.

**Avoid:** scroll-jacking, long pinned sections, continuous animated backgrounds, autoplay video, and animation on every row.

## Scrollable experience

Use a short, polished Overview page with sections such as:

1. Event hero and live status
2. Operational KPIs
3. Zone coverage
4. Attention queue
5. Upcoming shifts
6. Recent activity

Use `IntersectionObserver` for reveal effects where appropriate. Keep the main working views—Volunteers, Assignments, and Live Ops—fast and utility-focused rather than forcing long scroll animations into every workflow.

---

# 04 — Pages and interface requirements

## Global application shell

Persistent navigation:

- PULSE logo/name
- Event selector (one demo event is acceptable)
- Overview
- Volunteers
- Assignments
- Live Ops
- Event Setup
- Live/Simulation indicator
- Last-updated timestamp
- Alerts/notifications entry point

A profile/avatar menu may be decorative in the MVP.

## Page 1 — Overview / Command Center

**Question answered:** Where are we short-staffed, and what needs attention now?

### Required content

- Event name, venue, date/time, and status
- KPI cards:
  - Registered volunteers
  - Assigned volunteers
  - Coverage: filled slots / required slots
  - Checked-in volunteers
  - Open and critical incidents
  - Tasks completed / total
- Zone coverage cards or bars
- Needs-attention list: gaps, no-shows, critical incidents
- Upcoming shift timeline
- Recent activity feed

### Required actions

`View coverage` · `Add volunteer` · `Create task` · `Report incident` · `Send announcement` · `Refresh`

Every button must navigate, open a form, or perform a real action.

## Page 2 — Volunteers

### Required content

- Search by name, email, or skill
- Filters: skill, availability, and status
- List/table showing name, skills, available shifts, assigned zone, hours, and status
- Profile drawer/modal showing skills, availability, preference, assigned shifts, check-in status, and hours

### Required actions

`Add volunteer` · `View profile` · `Assign` · `Check in` · `Check out` · `Mark no-show` · `Mark dropout`

### Add-volunteer form

| Field | Requirement |
|---|---|
| Name | Required |
| Email/contact | Required for demo; do not expose in broad dashboard responses |
| Skills | Multi-select or comma-separated |
| Available shifts | Select one or more |
| Preferred zone | Optional |
| Maximum hours | Optional |
| Notes | Optional |

Confirm before destructive actions such as dropout or removing an assignment.

## Page 3 — Assignments & Coverage

### Required content

- Shift and zone filters
- Coverage grid showing required / assigned / gap
- Assignments grouped by zone and shift
- Volunteer eligibility preview: skill match, availability, conflict status, current hours
- Replacement suggestions after dropout/no-show
- Status labels: Open, Filled, At Risk, Overstaffed

### Required actions

`Assign volunteer` · `Suggest replacements` · `Confirm assignment` · `Remove assignment` · `Rebalance zone` · `Mark dropout`

### Assignment flow

1. Select an open role and shift.
2. Show only eligible candidates, with reasons such as “Skill match,” “Available,” and “No overlapping assignment.”
3. Select a candidate and confirm.
4. Update coverage and volunteer workload.
5. If no one is eligible, explain why and optionally suggest a move from an overstaffed zone.

Never silently move a volunteer.

## Page 4 — Live Ops

Use three tabs: **Tasks · Incidents · Announcements**

### Tasks

Each task displays title, zone, priority, assignee, status, and created time.

Actions: `Create task` · `Assign` · `Start` · `Resolve` · `Reopen`

Filters: zone, status, priority.

### Incidents

Each incident displays type, zone, severity, report time, assigned coordinator, acknowledgement, and status.

Suggested types: Medical, Crowd Surge, Missing Equipment, Entry/Access, Other.

Actions: `Report incident` · `Acknowledge` · `Assign coordinator` · `Escalate` · `Resolve`

Show the routing destination clearly. Escalation is recorded in the app; no real SMS or external notification is required.

### Announcements

Composer fields:

- Audience: Everyone / Zone / Role
- Message
- Priority: Normal / Urgent

Actions: `Preview` · `Send announcement`

History shows audience, author, time, and demo delivery status.

## Page 5 — Event Setup

Keep this page intentionally simple.

- Event name, date, venue
- Zones
- Roles per zone
- Required skills and headcount
- Shift blocks and start/end times

Actions: `Add zone` · `Add role` · `Add shift` · `Save setup`

Prefill the demo event. Basic add/edit behavior is enough; do not build a complex scheduling wizard.

---

# 05 — Core user journeys

## Journey A — Fill a coverage gap

1. Overview shows Entry Gate at 2/4 filled.
2. Coordinator selects `View coverage`.
3. Assignments opens filtered to Entry Gate.
4. Coordinator clicks `Suggest replacements`.
5. Eligible volunteers appear with matching reasons.
6. Coordinator confirms one volunteer.
7. Coverage updates and the activity feed records the assignment.

## Journey B — Recover from a dropout (hero demo)

1. A Registration volunteer drops out.
2. Their assignment becomes vacant and the coverage gap increases.
3. PULSE returns ranked eligible replacements.
4. Coordinator confirms a replacement.
5. Assignment list, coverage, volunteer schedule, and activity feed update.
6. If no eligible replacement exists, show that clearly and suggest a qualified volunteer from an overstaffed zone when possible.

## Journey C — Escalate an incident

1. Coordinator reports a Critical “Crowd Surge” incident at Entry Gate.
2. System routes it to the Operations/Zone Coordinator.
3. Incident appears at the top of the queue and on Overview.
4. Coordinator acknowledges it.
5. Coordinator resolves it.
6. Activity history records the lifecycle.

## Journey D — Track attendance

1. Volunteer checks in for an assigned shift.
2. Status changes to Checked In.
3. Volunteer checks out after the shift.
4. System calculates hours worked.
5. Attendance and volunteer-hour metrics update.

---

# 06 — Team ownership

## Team split

| Developer | Area | Owns |
|---|---|---|
| Backend Dev A | People, schedule, assignments | Event structure, volunteers, assignment validation, matching, coverage |
| Backend Dev B | Event operations | Tasks, incidents, routing/escalation, announcements, dashboard aggregation, activity |
| Frontend Dev C | Core app experience | App shell, Overview, Volunteers, Event Setup, shared UI components |
| Frontend Dev D | Operational workflows | Assignments, replacement flow, Live Ops, interaction polish and motion |

## Shared rule: agree on the contract first

In the first 10–15 minutes, all four developers must agree on:

- IDs are strings.
- Timestamps are ISO strings; event timezone is consistent.
- Status values are enums and shared across frontend/backend.
- Success response: `{ "data": ... }`
- Error response: `{ "error": { "message": "...", "code": "..." } }`
- One seeded demo event and consistent IDs.
- Frontend calls the API through one wrapper—not scattered direct `fetch()` calls.

---

# 07 — Backend specification

## Recommended architecture

Use the stack the team already knows. If undecided, use **Node.js + Express + SQLite or seeded in-memory JSON**.

- One backend service
- One `/api` prefix
- Basic CORS configuration
- Central error handler
- Simple request validation
- `/api/health` endpoint
- Seed data loaded at startup

Do not introduce microservices or a message queue.

## Backend Dev A — Event, Volunteer, Assignment & Matching

### Data models

**Event**
`id`, `name`, `venue`, `startAt`, `endAt`, `status`

**Zone**
`id`, `eventId`, `name`, `description`, `coordinatorName`

**Shift**
`id`, `eventId`, `name`, `startAt`, `endAt`

**Role**
`id`, `eventId`, `zoneId`, `shiftId`, `name`, `requiredSkills[]`, `requiredCount`, `priority`

**Volunteer**
`id`, `eventId`, `name`, `email`, `skills[]`, `availableShiftIds[]`, `preferredZoneId`, `maxHours`, `status`, `notes`

**Assignment**
`id`, `eventId`, `roleId`, `volunteerId`, `shiftId`, `status`, `assignedAt`, `checkInAt`, `checkOutAt`, `hoursWorked`

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | List events |
| GET | `/api/events/:eventId` | Event details |
| GET | `/api/events/:eventId/structure` | Zones, shifts, and roles |
| GET | `/api/events/:eventId/volunteers` | List/filter volunteers |
| POST | `/api/events/:eventId/volunteers` | Create volunteer |
| GET | `/api/events/:eventId/assignments` | List assignments; support shift/zone filters |
| POST | `/api/events/:eventId/assignments` | Assign volunteer to role |
| DELETE | `/api/events/:eventId/assignments/:assignmentId` | Remove assignment |
| POST | `/api/events/:eventId/assignments/:assignmentId/check-in` | Check in |
| POST | `/api/events/:eventId/assignments/:assignmentId/check-out` | Check out and calculate hours |
| POST | `/api/events/:eventId/assignments/:assignmentId/dropout` | Mark dropout and vacate slot |
| GET | `/api/events/:eventId/roles/:roleId/suggestions` | Return ranked eligible candidates |
| GET | `/api/events/:eventId/coverage` | Coverage by zone/role/shift |

### Validation requirements

- Reject missing required fields with `400`.
- Reject event/volunteer/role mismatches.
- Reject overlapping assignments for the same volunteer.
- Reject assignment to a full role unless explicitly replacing a vacancy.
- Check-in requires a valid assignment.
- Check-out requires a prior check-in.
- Calculate hours from check-in and check-out timestamps.
- Coverage excludes canceled/dropout assignments.
- Use consistent statuses: `available`, `assigned`, `checked_in`, `checked_out`, `dropout`, `no_show`.

### Candidate suggestion response

```json
{
  "data": [
    {
      "volunteerId": "vol-12",
      "name": "Aarav Shah",
      "score": 88,
      "reasons": [
        "Required skill: First Aid",
        "Available for this shift",
        "No overlapping assignment",
        "Lower assigned hours"
      ]
    }
  ]
}
```

Return at most the top three candidates for the MVP.

## Backend Dev B — Tasks, Incidents, Announcements & Dashboard

### Data models

**Task**
`id`, `eventId`, `zoneId`, `title`, `description`, `priority`, `status`, `assigneeVolunteerId`, `createdAt`, `updatedAt`

**Incident**
`id`, `eventId`, `zoneId`, `type`, `title`, `description`, `severity`, `status`, `assignedCoordinator`, `acknowledgedAt`, `resolvedAt`, `createdAt`, `escalatedAt`

**Announcement**
`id`, `eventId`, `audienceType`, `audienceId`, `message`, `priority`, `createdAt`, `deliveryStatus`

**Activity**
`id`, `eventId`, `type`, `message`, `createdAt`, `metadata`

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events/:eventId/tasks` | List/filter tasks |
| POST | `/api/events/:eventId/tasks` | Create task |
| PATCH | `/api/events/:eventId/tasks/:taskId` | Update status, assignee, or priority |
| GET | `/api/events/:eventId/incidents` | List/filter incidents |
| POST | `/api/events/:eventId/incidents` | Create and auto-route incident |
| PATCH | `/api/events/:eventId/incidents/:incidentId/acknowledge` | Acknowledge |
| PATCH | `/api/events/:eventId/incidents/:incidentId/escalate` | Escalate |
| PATCH | `/api/events/:eventId/incidents/:incidentId/resolve` | Resolve |
| GET | `/api/events/:eventId/announcements` | Announcement history |
| POST | `/api/events/:eventId/announcements` | Store demo announcement |
| GET | `/api/events/:eventId/dashboard` | Compact dashboard aggregates |
| GET | `/api/events/:eventId/activity` | Recent activity; support limit |

### Incident routing rules

| Incident context | Route to |
|---|---|
| Medical incident or First Aid zone | Medical Coordinator |
| Entry Gate, Stage, or Parking | Operations/Zone Coordinator |
| Missing/unknown coordinator | Event Lead |

Critical incidents should be flagged for attention. Escalation is an explicit action that updates the incident and creates an activity entry; no background timer is required.

### Dashboard response

Return only fields required by the Overview screen:

```json
{
  "data": {
    "volunteersRegistered": 16,
    "volunteersAssigned": 12,
    "checkedIn": 7,
    "coverage": { "filled": 12, "required": 18, "percent": 67 },
    "openIncidents": 1,
    "criticalIncidents": 1,
    "tasks": { "total": 8, "completed": 5 },
    "zones": [],
    "attentionItems": [],
    "upcomingShifts": [],
    "recentActivity": []
  }
}
```

### Backend integration rules

- Use shared event IDs and seed data with Backend Dev A.
- Agree on one activity logging helper/contract.
- Assignment, dropout, check-in/out, task, and incident changes should create activity entries.
- Do not duplicate coverage/dashboard aggregation across endpoints.
- Add `POST /api/demo/reset` only for local demo use.

---

# 08 — Frontend specification

## Recommended setup

React + Vite. Use the existing styling setup if one is already configured. Otherwise, plain CSS/CSS modules and a small shared component set are sufficient.

## Frontend Dev C — App shell, Overview, Volunteers, Event Setup

**Deliverables**
- Responsive app shell and navigation
- Overview KPIs, zone coverage, attention list, upcoming shifts, activity feed
- Volunteer search/filter/list
- Add-volunteer modal and profile drawer
- Basic Event Setup view
- Shared components:
  - `Button`
  - `Badge`
  - `Modal` / `Drawer`
  - `Card`
  - `Toast`
  - `Skeleton`
  - `StatCard`
  - `CoverageBar`
- Loading, error, and empty states

## Frontend Dev D — Assignments, Live Ops, Motion

**Deliverables**
- Shift/zone filters and coverage grid
- Assignment modal with eligibility reasons
- Dropout action and replacement suggestion panel
- Task board and status transitions
- Incident report, acknowledge, escalate, resolve
- Announcement composer/history
- Motion and responsive polish

## API client

Create one `src/lib/api.js` (or TypeScript equivalent) containing all network calls, such as:

- `getDashboard(eventId)`
- `getStructure(eventId)`
- `getVolunteers(eventId, filters)`
- `createVolunteer(eventId, payload)`
- `getCoverage(eventId, filters)`
- `getSuggestions(eventId, roleId)`
- `createAssignment(eventId, payload)`
- `dropoutAssignment(eventId, assignmentId)`
- `checkIn(...)` / `checkOut(...)`
- Task, incident, and announcement methods

Use one `API_BASE_URL` environment variable. If the backend is not ready, use a mock adapter with the same response shape so the UI can be integrated later without rewriting components.

## Interaction quality bar

- No dead buttons.
- Disable submit while saving.
- Show success/error toasts.
- Confirm destructive actions.
- Optimistically update simple status changes, then reconcile with the API.
- Restore prior UI state and show an error if a request fails.
- Keep selected event/shift/zone in one source of truth.
- Validate forms in the browser and again on the server.
- Use accessible labels, visible keyboard focus, and sufficient contrast.

---

# 09 — Matching and reassignment logic

Use **transparent rule-based matching**, not an “AI” claim.

## Hard constraints

A candidate must:

- Be active and not marked dropout/no-show.
- Be available for the target shift.
- Have no overlapping assignment.
- Not already occupy the target slot.
- Match the role’s required skills according to one consistent rule.

For this MVP, require **at least one matching skill** when a role lists required skills. For critical roles such as First Aid, require the designated skill explicitly.

## Soft ranking

Suggested score out of 100:

| Factor | Points |
|---|---:|
| Skill match | 0–40 |
| Availability / preferred shift | 0–20 |
| Preferred zone | 0–10 |
| Workload fairness (fewer assigned hours scores higher) | 0–20 |
| Zone continuity (optional) | 0–10 |

Tie-break by fewer assigned hours, then alphabetical name for stable results.

## Rebalance behavior

1. Identify understaffed and overstaffed zones for the same shift.
2. Find volunteers who are qualified, available, and conflict-free.
3. Suggest a move with a reason.
4. Require coordinator confirmation.
5. Never silently change a volunteer’s assignment.

---

# 10 — Demo data

Use one clearly fictional event:

**TSEC TechFest — Main Arena**  
Venue: Campus event grounds · Demo event

## Zones

- Entry Gate
- Registration
- Main Stage
- Parking
- First Aid

## Shifts

- Morning: 09:00–13:00
- Afternoon: 13:00–17:00
- Evening: 17:00–21:00

## Roles and required headcount

| Zone | Role | Required |
|---|---|---:|
| Entry Gate | Queue Support | 4 |
| Entry Gate | Crowd Guide | 2 |
| Registration | Check-in Desk | 3 |
| Registration | Help Desk | 1 |
| Main Stage | Stage Support | 3 |
| Main Stage | Runner | 2 |
| Parking | Parking Guide | 3 |
| First Aid | First Aid Volunteer | 2 |

Seed 12–16 fictional volunteers with varied skills, availability, preferred zones, and workload. Include:

- One Registration volunteer who can be marked as a dropout
- Two qualified replacement candidates with different workload totals
- One overstaffed zone to demonstrate rebalancing
- One volunteer with an overlapping assignment to test conflict prevention
- Several checked-in volunteers
- Two open tasks and one resolved task
- One active incident and one resolved incident
- Recent activity records

---

# 11 — Four-hour execution plan

| Time | Focus | Backend | Frontend |
|---|---|---|---|
| 00:00–00:15 | Contract and setup | Agree models, seed event, health route | Create shell, mock API, shared tokens |
| 00:15–01:15 | Parallel MVP | A: structure/volunteers/assignments/matching; B: ops/dashboard | C: Overview/Volunteers; D: Assignments/Live Ops |
| 01:15–01:30 | Integration checkpoint | Confirm core endpoints and response shapes | Connect Overview and one action to live API |
| 01:30–02:30 | Core workflows | Complete validation, replacement, attendance, incidents | Connect forms/actions and update dependent views |
| 02:30–03:15 | Integration freeze | Fix API errors and data consistency | Fix broken actions, stale counts, loading/error states |
| 03:15–03:45 | Visual polish | Avoid risky backend changes | Responsive checks, motion, spacing, toasts |
| 03:45–04:00 | Rehearse | Reset seed; verify endpoints | Run demo script and prepare pitch |

**Feature freeze:** no major new features after 02:30. Protect the final 90 minutes for integration, polish, and rehearsal.

---

# 12 — Performance and integration rules

## Frontend performance

- Animate `transform` and `opacity`; avoid animating layout properties.
- Use `prefers-reduced-motion`.
- Lazy-load noncritical images; prefer local assets, CSS, or gradients.
- Use simple CSS bars or lightweight SVG for charts.
- Debounce search by 250–350ms.
- Cap demo lists (for example, first 50 records) or paginate if needed.
- Use stable React keys; avoid unnecessary re-renders.
- Do not add a large animation library late in the sprint.

## API and state performance

- Dashboard aggregation happens server-side; avoid N+1 frontend requests.
- Do not poll every endpoint.
- Prefer manual refresh and targeted updates after mutations.
- If live-feel polling is used, poll only the compact dashboard every 15 seconds and pause when the tab is hidden.
- Refresh only affected data:
  - Assignment change → assignments, coverage, affected volunteer, dashboard KPIs
  - Incident change → incidents, attention count, activity
  - Task change → task list, task KPI
- Keep responses compact; avoid repeating event data in every response.
- Do not include contact details in dashboard payloads.
- Show “Updated just now” or an elapsed timestamp instead of polling aggressively.
- Use request timeouts and visible errors; never leave infinite spinners.
- Log detailed errors on the server, but return concise client-safe messages.

## Backend simplicity

- One service and one data store (or seeded in-memory state).
- Keep mutation behavior consistent during the demo.
- No external APIs required.
- Use a static SVG/gradient venue schematic if a visual map is desired.

---

# 13 — Acceptance checklist

## Problem-statement coverage

| Requirement | Implementation | Owner |
|---|---|---|
| Event and role setup | Event, zones, shifts, roles, skills, headcount | Backend A + Frontend C |
| Skill-based shift assignment | Eligibility constraints and ranked suggestions | Backend A + Frontend D |
| Dropout/no-show recovery | Vacate slot, suggest replacements, coordinator confirms | Backend A + Frontend D |
| Volunteer profiles/check-in | Profile, skills, availability, check-in/out, hours | Backend A + Frontend C/D |
| Live task board | Create, assign, update status, filter by zone | Backend B + Frontend D |
| Announcements | Audience-targeted demo send and history | Backend B + Frontend D |
| Incident routing/escalation | Rule-based routing, acknowledge, escalate, resolve | Backend B + Frontend D |
| Coordination dashboard | Coverage, attendance, tasks, issues, suggestions | Backend A/B + Frontend C |
| Live visibility | Targeted refresh, activity feed, optional low-frequency polling | Backend B + Frontend C/D |
| Optimized experience | Responsive UI, reduced motion, compact API calls | Frontend C/D |

## Final pre-demo checklist

- [ ] Seed/reset works.
- [ ] Dashboard is populated on first load.
- [ ] Add volunteer works.
- [ ] Assignment rejects an overlapping shift.
- [ ] Dropout produces replacement suggestions.
- [ ] Confirming a replacement updates coverage.
- [ ] Check-in/out updates attendance and hours.
- [ ] Task status can move through the workflow.
- [ ] Incident can be reported, acknowledged, escalated, and resolved.
- [ ] Announcement can be created for a selected audience.
- [ ] No dead buttons or infinite loading states.
- [ ] Desktop and mobile layouts checked.
- [ ] Demo has been rehearsed once without developer tools.

---

# 14 — Demo pitch

> “Meet PULSE, our event operations command center. Instead of coordinating volunteers through disconnected spreadsheets and chat groups, organizers can see staffing, attendance, tasks, and incidents in one place.
>
> Here, Entry Gate is short by two volunteers. We open the role and see candidates ranked by skills, availability, shift conflicts, and workload fairness.
>
> Now a Registration volunteer drops out. PULSE marks the slot vacant and suggests eligible replacements. The coordinator confirms one, and coverage updates immediately.
>
> A crowd-surge incident is reported at Entry Gate. It is routed to the operations coordinator, acknowledged, and resolved with an activity trail.
>
> PULSE gives organizers the visibility and next action they need to keep an event running smoothly.”

---

## Final build rules

1. A complete workflow beats a large number of disconnected features.
2. Keep matching explainable; do not claim AI.
3. Every visible action must work or be clearly marked as out of scope.
4. Simulate external integrations rather than losing time building them.
5. Make the interface energetic but keep operational tasks fast and readable.
6. Keep API calls targeted and responses compact.
7. Freeze features early enough to integrate and rehearse.
