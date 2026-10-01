import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import { calculateEventCoverage } from '../services/coverageService.js';
import { calculateEventResilience } from '../services/resilienceService.js';
import { simulateDisruption as runSimulation } from '../services/simulationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events
 * List all events.
 */
export const getEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const events = await Event.find(filter).sort({ startTime: 1, createdAt: -1 });
    return sendSuccess(res, events, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId
 * Retrieve event details by ID.
 */
export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    });

    if (!event) {
      return sendError(res, 'Event not found', 'EVENT_NOT_FOUND', 404);
    }

    return sendSuccess(res, event, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/structure
 * Retrieve complete structural hierarchy: Event, Zones, Shifts, and Roles.
 */
export const getEventStructure = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    });

    if (!event) {
      return sendError(res, 'Event not found', 'EVENT_NOT_FOUND', 404);
    }

    const refQuery = {
      $or: [
        { event: event._id },
        { eventId: eventId },
        { eventId },
        ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    };

    const [zones, shifts, roles] = await Promise.all([
      Zone.find(refQuery).sort({ name: 1 }),
      Shift.find(refQuery).sort({ startTime: 1 }),
      Role.find(refQuery).sort({ name: 1 }),
    ]);

    return sendSuccess(
      res,
      {
        event,
        zones,
        shifts,
        roles,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/coverage
 * Dynamic event coverage by zone, shift, and role.
 */
export const getEventCoverage = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { shiftId, shift } = req.query;
    const coverage = await calculateEventCoverage(eventId, shiftId || shift || null);
    return sendSuccess(res, coverage, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/events/:eventId/resilience
 * Event resilience and risk evaluation.
 */
export const getEventResilience = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const resilience = await calculateEventResilience(eventId);
    return sendSuccess(res, resilience, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * POST /api/events/:eventId/simulate
 * What-if event disruption simulation.
 */
export const simulateDisruption = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await runSimulation(eventId, req.body);
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};

/**
 * POST /api/events
 * Create a new event.
 */
export const createEvent = async (req, res, next) => {
  try {
    const { name, description, venue, startTime, endTime, startAt, endAt, status } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Event name is required', 'VALIDATION_ERROR', 400);
    }

    const start = startTime || startAt;
    const end = endTime || endAt;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return sendError(res, 'Invalid date format for startTime or endTime', 'VALIDATION_ERROR', 400);
      }
      if (startDate >= endDate) {
        return sendError(res, 'End time must be after start time', 'VALIDATION_ERROR', 400);
      }
    }

    const event = await Event.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      venue: venue ? venue.trim() : '',
      startTime: start ? new Date(start) : null,
      endTime: end ? new Date(end) : null,
      status: status || 'active',
    });

    return sendSuccess(res, event, 201);
  } catch (error) {
    next(error);
  }
};
