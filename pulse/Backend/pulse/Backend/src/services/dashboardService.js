import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Incident from '../models/Incident.js';
import Announcement from '../models/Announcement.js';
import Activity from '../models/Activity.js';
import Event from '../models/Event.js';

/**
 * Aggregates operational and coordination metrics for an event.
 *
 * @param {string} eventId
 * @returns {Promise<Object>} Aggregated dashboard object
 */
export const getEventDashboard = async (eventId) => {
  const trimmedId = String(eventId || '').trim();
  if (!trimmedId) {
    const error = new Error('Event ID is required');
    error.statusCode = 400;
    error.code = 'INVALID_EVENT_ID';
    throw error;
  }

  const db = mongoose.connection.db;
  if (!db) {
    const error = new Error('Database connection is unavailable');
    error.statusCode = 500;
    error.code = 'DATABASE_UNAVAILABLE';
    throw error;
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(trimmedId);
  const idQuery = [
    { _id: trimmedId },
    ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(trimmedId) }] : []),
  ];

  // 1. Retrieve Event Record
  const eventDoc = await db.collection('events').findOne({ $or: idQuery });

  // 2. Fetch parallel collection data belonging to this event
  const [
    tasks,
    incidents,
    announcements,
    recentActivity,
    zones,
    roles,
    assignments,
    volunteers,
  ] = await Promise.all([
    Task.find({ eventId: trimmedId }),
    Incident.find({ eventId: trimmedId }),
    Announcement.find({ eventId: trimmedId }),
    Activity.find({ eventId: trimmedId }).sort({ createdAt: -1 }).limit(10),
    db.collection('zones').find({
      $or: [
        { event: trimmedId },
        { eventId: trimmedId },
        ...(isObjectId
          ? [
              { event: new mongoose.Types.ObjectId(trimmedId) },
              { eventId: new mongoose.Types.ObjectId(trimmedId) },
            ]
          : []),
      ],
    }).toArray(),
    db.collection('roles').find({
      $or: [
        { event: trimmedId },
        { eventId: trimmedId },
        ...(isObjectId
          ? [
              { event: new mongoose.Types.ObjectId(trimmedId) },
              { eventId: new mongoose.Types.ObjectId(trimmedId) },
            ]
          : []),
      ],
    }).toArray(),
    db.collection('assignments').find({
      $or: [
        { event: trimmedId },
        { eventId: trimmedId },
        ...(isObjectId
          ? [
              { event: new mongoose.Types.ObjectId(trimmedId) },
              { eventId: new mongoose.Types.ObjectId(trimmedId) },
            ]
          : []),
      ],
    }).toArray(),
    db.collection('volunteers').find({
      $or: [
        { event: trimmedId },
        { eventId: trimmedId },
        ...(isObjectId
          ? [
              { event: new mongoose.Types.ObjectId(trimmedId) },
              { eventId: new mongoose.Types.ObjectId(trimmedId) },
            ]
          : []),
      ],
    }).toArray(),
  ]);

  // Check if event exists or has any data in the system
  const hasEventData =
    Boolean(eventDoc) ||
    tasks.length > 0 ||
    incidents.length > 0 ||
    announcements.length > 0 ||
    zones.length > 0;

  if (!hasEventData) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    error.code = 'EVENT_NOT_FOUND';
    throw error;
  }

  // Task metrics
  const taskTotal = tasks.length;
  const taskOpen = tasks.filter((t) => t.status === 'Open').length;
  const taskInProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const taskResolved = tasks.filter((t) => t.status === 'Resolved').length;

  // Incident metrics
  const incidentTotal = incidents.length;
  const incidentOpen = incidents.filter((i) => i.status === 'Open').length;
  const incidentAcknowledged = incidents.filter((i) => i.status === 'Acknowledged').length;
  const incidentEscalated = incidents.filter((i) => i.status === 'Escalated').length;
  const incidentResolved = incidents.filter((i) => i.status === 'Resolved').length;
  const incidentCritical = incidents.filter((i) => i.severity === 'Critical').length;

  // Announcement metrics
  const announcementTotal = announcements.length;
  const announcementPublished = announcements.filter((a) => a.status === 'Published').length;
  const announcementUrgent = announcements.filter((a) => a.priority === 'Urgent').length;

  // Volunteer metrics
  const volTotal = volunteers.length;
  const assignedVolunteersCount =
    assignments.length > 0
      ? new Set(assignments.map((a) => String(a.volunteerId || a.volunteer))).size
      : volunteers.filter((v) => v.status === 'assigned').length;

  const checkedInCount = assignments.filter(
    (a) => a.status === 'checked_in' || (a.checkInAt && !a.checkOutAt)
  ).length;

  const unassignedVolunteersCount = Math.max(0, volTotal - assignedVolunteersCount);

  // Assignment and Coverage metrics
  const activeAssignments = assignments.filter(
    (a) => a.status !== 'dropout' && a.status !== 'no_show'
  );
  const filledSlots = activeAssignments.length;

  // Calculate required headcount from roles
  const requiredSlots = roles.reduce(
    (sum, r) => sum + (Number(r.requiredCount || r.capacity) || 0),
    0
  );
  const coveragePercent =
    requiredSlots > 0 ? Math.round((filledSlots / requiredSlots) * 100) : 0;

  // Formatted Event Overview
  const eventOverview = {
    id: eventDoc ? eventDoc._id.toString() : trimmedId,
    name: eventDoc?.name || (eventDoc ? 'Unnamed Event' : trimmedId),
    status: eventDoc?.status || 'active',
    venue: eventDoc?.venue || '',
    startTime: eventDoc?.startTime || null,
    endTime: eventDoc?.endTime || null,
  };

  // Structured response supporting both dashboard section hierarchy and flat overview KPIs
  return {
    event: eventOverview,
    metrics: {
      volunteers: {
        total: volTotal,
        assigned: assignedVolunteersCount,
        unassigned: unassignedVolunteersCount,
        checkedIn: checkedInCount,
      },
      assignments: {
        total: assignments.length,
        filled: filledSlots,
        required: requiredSlots,
        percent: coveragePercent,
      },
      tasks: {
        total: taskTotal,
        open: taskOpen,
        inProgress: taskInProgress,
        resolved: taskResolved,
        completed: taskResolved,
      },
      incidents: {
        total: incidentTotal,
        open: incidentOpen,
        acknowledged: incidentAcknowledged,
        escalated: incidentEscalated,
        resolved: incidentResolved,
        critical: incidentCritical,
      },
      announcements: {
        total: announcementTotal,
        published: announcementPublished,
        urgent: announcementUrgent,
      },
    },
    // Top-level conveniences matching PRD Overview contract
    volunteersRegistered: volTotal,
    volunteersAssigned: assignedVolunteersCount,
    checkedIn: checkedInCount,
    coverage: {
      filled: filledSlots,
      required: requiredSlots,
      percent: coveragePercent,
    },
    openIncidents: incidentOpen,
    criticalIncidents: incidentCritical,
    tasks: {
      total: taskTotal,
      open: taskOpen,
      inProgress: taskInProgress,
      resolved: taskResolved,
      completed: taskResolved,
    },
    zones: zones.map((z) => ({
      id: z._id.toString(),
      name: z.name,
      capacity: z.capacity || null,
    })),
    recentActivity,
  };
};

export default {
  getEventDashboard,
};
