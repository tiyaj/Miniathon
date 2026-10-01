import mongoose from 'mongoose';
import Incident from '../models/Incident.js';
import { logActivity } from '../models/Activity.js';
import { routeIncident } from '../services/incidentRoutingService.js';
import { validateZoneReference } from './taskController.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  DEFAULT_INCIDENT_SEVERITY,
  DEFAULT_INCIDENT_STATUS,
} from '../utils/constants.js';

/**
 * Helper to safely find an incident by ID supporting both ObjectId and string formats.
 */
export const findIncidentById = async (incidentId) => {
  if (!incidentId) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(incidentId);
  try {
    return await Incident.findOne({
      $or: [
        { _id: incidentId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(incidentId) }] : []),
      ],
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return null;
    }
    throw err;
  }
};

/**
 * GET /api/events/:eventId/incidents
 * Retrieve incidents for an event, supporting filters: zoneId, status, severity, type.
 */
export const getIncidents = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { zoneId, status, severity, type } = req.query;
    const filter = { eventId: eventId.trim() };

    if (zoneId !== undefined) {
      if (typeof zoneId !== 'string' || !zoneId.trim()) {
        return sendError(res, 'Zone ID filter cannot be empty', 'INVALID_FILTER', 400);
      }
      filter.zoneId = zoneId.trim();
    }

    if (status !== undefined) {
      if (!INCIDENT_STATUSES.includes(status)) {
        return sendError(
          res,
          `Invalid status filter. Allowed values: ${INCIDENT_STATUSES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.status = status;
    }

    if (severity !== undefined) {
      if (!INCIDENT_SEVERITIES.includes(severity)) {
        return sendError(
          res,
          `Invalid severity filter. Allowed values: ${INCIDENT_SEVERITIES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.severity = severity;
    }

    if (type !== undefined) {
      if (typeof type !== 'string' || !type.trim()) {
        return sendError(res, 'Type filter cannot be empty', 'INVALID_FILTER', 400);
      }
      filter.type = type.trim();
    }

    const incidents = await Incident.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, incidents, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/incidents
 * Report a new incident, automatically route coordinator, and log activity.
 */
export const createIncident = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return sendError(res, 'Invalid request body', 'INVALID_PAYLOAD', 400);
    }

    const { zoneId, type, title, description, severity } = payload;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return sendError(res, 'Incident title is required', 'VALIDATION_ERROR', 400);
    }

    if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
      return sendError(res, 'Zone ID is required', 'VALIDATION_ERROR', 400);
    }

    if (severity !== undefined && !INCIDENT_SEVERITIES.includes(severity)) {
      return sendError(
        res,
        `Severity must be one of: ${INCIDENT_SEVERITIES.join(', ')}`,
        'INVALID_SEVERITY',
        400
      );
    }

    // Validate zone reference if relationships are available
    const zoneValidation = await validateZoneReference(eventId.trim(), zoneId.trim());
    if (!zoneValidation.valid) {
      return sendError(res, zoneValidation.message, zoneValidation.code, 400);
    }

    // Determine assigned coordinator automatically via routing service
    const assignedCoordinator = await routeIncident({
      type: type || 'General',
      zoneId: zoneId.trim(),
      eventId: eventId.trim(),
    });

    const incidentData = {
      eventId: eventId.trim(),
      zoneId: zoneId.trim(),
      type: typeof type === 'string' && type.trim() ? type.trim() : 'General',
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      severity: severity || DEFAULT_INCIDENT_SEVERITY,
      status: DEFAULT_INCIDENT_STATUS,
      assignedCoordinator,
    };

    const incident = await Incident.create(incidentData);

    // Record activity log
    await logActivity(
      eventId.trim(),
      'incident_reported',
      `Incident reported: ${incident.title} (${incident.severity}) in zone ${incident.zoneId}`,
      {
        incidentId: incident.id,
        severity: incident.severity,
        zoneId: incident.zoneId,
        assignedCoordinator: incident.assignedCoordinator,
      }
    );

    return sendSuccess(res, incident, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/events/:eventId/incidents/:incidentId/acknowledge
 * Acknowledge an incident and record timestamp.
 */
export const acknowledgeIncident = async (req, res, next) => {
  try {
    const { eventId, incidentId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    if (!incidentId || !incidentId.trim()) {
      return sendError(res, 'Incident ID is required', 'INVALID_INCIDENT_ID', 400);
    }

    const incident = await findIncidentById(incidentId.trim());
    if (!incident) {
      return sendError(res, 'Incident not found', 'INCIDENT_NOT_FOUND', 404);
    }

    if (incident.eventId !== eventId.trim()) {
      return sendError(res, 'Incident not found for this event', 'INCIDENT_NOT_FOUND', 404);
    }

    // State validation: resolved incidents cannot be acknowledged
    if (incident.status === 'Resolved') {
      return sendError(
        res,
        'Cannot acknowledge an already resolved incident',
        'INVALID_STATE_TRANSITION',
        400
      );
    }

    // Idempotent check
    if (incident.status === 'Acknowledged') {
      return sendSuccess(res, incident, 200);
    }

    incident.status = 'Acknowledged';
    if (!incident.acknowledgedAt) {
      incident.acknowledgedAt = new Date();
    }
    await incident.save();

    // Record activity log
    await logActivity(
      eventId.trim(),
      'incident_acknowledged',
      `Incident acknowledged: ${incident.title}`,
      {
        incidentId: incident.id,
        status: incident.status,
        acknowledgedAt: incident.acknowledgedAt,
      }
    );

    return sendSuccess(res, incident, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/events/:eventId/incidents/:incidentId/escalate
 * Escalate an incident and record timestamp.
 */
export const escalateIncident = async (req, res, next) => {
  try {
    const { eventId, incidentId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    if (!incidentId || !incidentId.trim()) {
      return sendError(res, 'Incident ID is required', 'INVALID_INCIDENT_ID', 400);
    }

    const incident = await findIncidentById(incidentId.trim());
    if (!incident) {
      return sendError(res, 'Incident not found', 'INCIDENT_NOT_FOUND', 404);
    }

    if (incident.eventId !== eventId.trim()) {
      return sendError(res, 'Incident not found for this event', 'INCIDENT_NOT_FOUND', 404);
    }

    // State validation: resolved incidents cannot be escalated
    if (incident.status === 'Resolved') {
      return sendError(
        res,
        'Cannot escalate an already resolved incident',
        'INVALID_STATE_TRANSITION',
        400
      );
    }

    // Idempotent check
    if (incident.status === 'Escalated') {
      return sendSuccess(res, incident, 200);
    }

    incident.status = 'Escalated';
    if (!incident.escalatedAt) {
      incident.escalatedAt = new Date();
    }
    await incident.save();

    // Record activity log
    await logActivity(
      eventId.trim(),
      'incident_escalated',
      `Incident escalated: ${incident.title}`,
      {
        incidentId: incident.id,
        status: incident.status,
        escalatedAt: incident.escalatedAt,
      }
    );

    return sendSuccess(res, incident, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/events/:eventId/incidents/:incidentId/resolve
 * Resolve an incident and record timestamp.
 */
export const resolveIncident = async (req, res, next) => {
  try {
    const { eventId, incidentId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    if (!incidentId || !incidentId.trim()) {
      return sendError(res, 'Incident ID is required', 'INVALID_INCIDENT_ID', 400);
    }

    const incident = await findIncidentById(incidentId.trim());
    if (!incident) {
      return sendError(res, 'Incident not found', 'INCIDENT_NOT_FOUND', 404);
    }

    if (incident.eventId !== eventId.trim()) {
      return sendError(res, 'Incident not found for this event', 'INCIDENT_NOT_FOUND', 404);
    }

    // Idempotent check
    if (incident.status === 'Resolved') {
      return sendSuccess(res, incident, 200);
    }

    incident.status = 'Resolved';
    if (!incident.resolvedAt) {
      incident.resolvedAt = new Date();
    }
    await incident.save();

    // Record activity log
    await logActivity(
      eventId.trim(),
      'incident_resolved',
      `Incident resolved: ${incident.title}`,
      {
        incidentId: incident.id,
        status: incident.status,
        resolvedAt: incident.resolvedAt,
      }
    );

    return sendSuccess(res, incident, 200);
  } catch (error) {
    next(error);
  }
};
