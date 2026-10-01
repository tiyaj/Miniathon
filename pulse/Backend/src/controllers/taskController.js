import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
} from '../utils/constants.js';

/**
 * Helper to safely find a task by ID supporting both ObjectId and string ID formats.
 */
export const findTaskById = async (taskId) => {
  if (!taskId) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(taskId);
  try {
    return await Task.findOne({
      $or: [
        { _id: taskId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(taskId) }] : []),
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
 * Validate that the specified zone exists and belongs to the specified event, if relationships are present.
 */
export const validateZoneReference = async (eventId, zoneId) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return { valid: true };

    const isObjectId = mongoose.Types.ObjectId.isValid(zoneId);
    const zone = await db.collection('zones').findOne({
      $or: [
        { _id: zoneId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(zoneId) }] : []),
      ],
    });

    if (zone) {
      const zoneEvent = zone.event?.toString() || zone.eventId?.toString();
      if (zoneEvent && zoneEvent !== eventId) {
        return {
          valid: false,
          message: 'Zone does not belong to the specified event',
          code: 'INVALID_ZONE',
        };
      }
      return { valid: true };
    }

    // Check if the event has zones registered in the database
    const eventHasZones = await db.collection('zones').countDocuments({
      $or: [
        { event: eventId },
        { eventId: eventId },
        ...(mongoose.Types.ObjectId.isValid(eventId)
          ? [
              { event: new mongoose.Types.ObjectId(eventId) },
              { eventId: new mongoose.Types.ObjectId(eventId) },
            ]
          : []),
      ],
    });

    if (eventHasZones > 0) {
      return {
        valid: false,
        message: 'Zone not found for this event',
        code: 'ZONE_NOT_FOUND',
      };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
};

/**
 * Validate that the specified volunteer exists and belongs to the specified event, if relationships are present.
 */
export const validateVolunteerReference = async (eventId, volunteerId) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return { valid: true };

    const isObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
    const volunteer = await db.collection('volunteers').findOne({
      $or: [
        { _id: volunteerId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
      ],
    });

    if (volunteer) {
      const volEvent = volunteer.event?.toString() || volunteer.eventId?.toString();
      if (volEvent && volEvent !== eventId) {
        return {
          valid: false,
          message: 'Volunteer does not belong to the specified event',
          code: 'INVALID_VOLUNTEER',
        };
      }
      return { valid: true };
    }

    const volunteerCount = await db.collection('volunteers').countDocuments();
    if (volunteerCount > 0 && isObjectId) {
      return {
        valid: false,
        message: 'Volunteer not found',
        code: 'VOLUNTEER_NOT_FOUND',
      };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
};

/**
 * GET /api/events/:eventId/tasks
 * Retrieve tasks for a specific event with optional filters: zoneId, status, priority.
 */
export const getTasks = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { zoneId, status, priority } = req.query;
    const filter = { eventId: eventId.trim() };

    if (zoneId !== undefined) {
      if (typeof zoneId !== 'string' || !zoneId.trim()) {
        return sendError(res, 'Zone ID filter cannot be empty', 'INVALID_FILTER', 400);
      }
      filter.zoneId = zoneId.trim();
    }

    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return sendError(
          res,
          `Invalid status filter. Allowed values: ${TASK_STATUSES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.status = status;
    }

    if (priority !== undefined) {
      if (!TASK_PRIORITIES.includes(priority)) {
        return sendError(
          res,
          `Invalid priority filter. Allowed values: ${TASK_PRIORITIES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.priority = priority;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, tasks, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/tasks
 * Create a new task for the specified event.
 */
export const createTask = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { zoneId, title, description, priority, status, assigneeVolunteerId } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return sendError(res, 'Task title is required', 'VALIDATION_ERROR', 400);
    }

    if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
      return sendError(res, 'Zone ID is required', 'VALIDATION_ERROR', 400);
    }

    // Validate priority if supplied
    if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
      return sendError(
        res,
        `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
        'INVALID_PRIORITY',
        400
      );
    }

    // Validate status if supplied
    if (status !== undefined && !TASK_STATUSES.includes(status)) {
      return sendError(
        res,
        `Status must be one of: ${TASK_STATUSES.join(', ')}`,
        'INVALID_STATUS',
        400
      );
    }

    // Validate zone reference if relationships are available
    if (zoneId) {
      const zoneValidation = await validateZoneReference(eventId.trim(), zoneId.trim());
      if (!zoneValidation.valid) {
        return sendError(res, zoneValidation.message, zoneValidation.code, 400);
      }
    }

    // Validate volunteer reference if relationships are available
    if (assigneeVolunteerId) {
      const volValidation = await validateVolunteerReference(
        eventId.trim(),
        assigneeVolunteerId.trim()
      );
      if (!volValidation.valid) {
        return sendError(res, volValidation.message, volValidation.code, 400);
      }
    }

    const taskData = {
      eventId: eventId.trim(),
      zoneId: zoneId.trim(),
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      priority: priority || DEFAULT_TASK_PRIORITY,
      status: status || DEFAULT_TASK_STATUS,
      assigneeVolunteerId: assigneeVolunteerId ? assigneeVolunteerId.trim() : null,
    };

    const task = await Task.create(taskData);
    return sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/events/:eventId/tasks/:taskId
 * Update details, status, or assignee of an existing task.
 */
export const updateTask = async (req, res, next) => {
  try {
    const { eventId, taskId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    if (!taskId || !taskId.trim()) {
      return sendError(res, 'Task ID is required', 'INVALID_TASK_ID', 400);
    }

    const payload = req.body;
    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      Object.keys(payload).length === 0
    ) {
      return sendError(res, 'Update payload cannot be empty', 'EMPTY_PAYLOAD', 400);
    }

    // Only allow updating supported fields; prevent overriding system-managed fields
    const allowedFields = [
      'title',
      'description',
      'zoneId',
      'priority',
      'status',
      'assigneeVolunteerId',
    ];

    const updates = {};
    let hasAllowedField = false;

    for (const key of Object.keys(payload)) {
      if (allowedFields.includes(key)) {
        hasAllowedField = true;
        updates[key] = payload[key];
      }
    }

    if (!hasAllowedField) {
      return sendError(
        res,
        'No valid updatable fields provided in request body',
        'INVALID_PAYLOAD',
        400
      );
    }

    // Validate title if present
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || !updates.title.trim()) {
        return sendError(res, 'Task title cannot be empty', 'VALIDATION_ERROR', 400);
      }
      updates.title = updates.title.trim();
    }

    // Validate description if present
    if (updates.description !== undefined) {
      if (typeof updates.description !== 'string') {
        return sendError(res, 'Description must be a string', 'VALIDATION_ERROR', 400);
      }
      updates.description = updates.description.trim();
    }

    // Validate priority if present
    if (updates.priority !== undefined && !TASK_PRIORITIES.includes(updates.priority)) {
      return sendError(
        res,
        `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
        'INVALID_PRIORITY',
        400
      );
    }

    // Validate status if present
    if (updates.status !== undefined && !TASK_STATUSES.includes(updates.status)) {
      return sendError(
        res,
        `Status must be one of: ${TASK_STATUSES.join(', ')}`,
        'INVALID_STATUS',
        400
      );
    }

    // Validate zone if present
    if (updates.zoneId !== undefined) {
      if (typeof updates.zoneId !== 'string' || !updates.zoneId.trim()) {
        return sendError(res, 'Zone ID cannot be empty', 'VALIDATION_ERROR', 400);
      }
      updates.zoneId = updates.zoneId.trim();
      const zoneValidation = await validateZoneReference(eventId.trim(), updates.zoneId);
      if (!zoneValidation.valid) {
        return sendError(res, zoneValidation.message, zoneValidation.code, 400);
      }
    }

    // Validate volunteer if present
    if (updates.assigneeVolunteerId !== undefined) {
      if (updates.assigneeVolunteerId === null || updates.assigneeVolunteerId === '') {
        updates.assigneeVolunteerId = null;
      } else {
        if (typeof updates.assigneeVolunteerId !== 'string') {
          return sendError(res, 'Volunteer ID must be a string or null', 'VALIDATION_ERROR', 400);
        }
        updates.assigneeVolunteerId = updates.assigneeVolunteerId.trim();
        const volValidation = await validateVolunteerReference(
          eventId.trim(),
          updates.assigneeVolunteerId
        );
        if (!volValidation.valid) {
          return sendError(res, volValidation.message, volValidation.code, 400);
        }
      }
    }

    // Find task
    const task = await findTaskById(taskId.trim());
    if (!task) {
      return sendError(res, 'Task not found', 'TASK_NOT_FOUND', 404);
    }

    // Verify task belongs to the event in the URL
    if (task.eventId !== eventId.trim()) {
      return sendError(res, 'Task not found for this event', 'TASK_NOT_FOUND', 404);
    }

    // Apply updates and save
    Object.assign(task, updates);
    await task.save();

    return sendSuccess(res, task, 200);
  } catch (error) {
    next(error);
  }
};
