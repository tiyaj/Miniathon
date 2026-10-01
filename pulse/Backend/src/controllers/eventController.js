import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Zone from '../models/Zone.js';
import Shift from '../models/Shift.js';
import Role from '../models/Role.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events
 * List all events.
 */
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
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
    const eventQuery = {
      $or: [
        { _id: eventId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    };

    const event = await Event.findOne(eventQuery);
    if (!event) {
      return sendError(res, 'Event not found', 'EVENT_NOT_FOUND', 404);
    }

    const refQuery = {
      $or: [
        { event: event._id },
        { event: eventId },
        { eventId },
        ...(isObjectId ? [{ event: new mongoose.Types.ObjectId(eventId) }] : []),
      ],
    };

    const [zones, shifts, roles] = await Promise.all([
      Zone.find(refQuery),
      Shift.find(refQuery),
      Role.find(refQuery),
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
 * POST /api/events
 * Create a new event.
 */
export const createEvent = async (req, res, next) => {
  try {
    const { name, description, venue, startTime, endTime, status } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Event name is required', 'VALIDATION_ERROR', 400);
    }

    const event = await Event.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      venue: venue ? venue.trim() : '',
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      status: status || 'draft',
    });

    return sendSuccess(res, event, 201);
  } catch (error) {
    next(error);
  }
};
