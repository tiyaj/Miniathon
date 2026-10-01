import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import { logActivity } from '../models/Activity.js';
import { validateZoneReference } from './taskController.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_STATUSES,
  DEFAULT_ANNOUNCEMENT_PRIORITY,
  DEFAULT_ANNOUNCEMENT_AUDIENCE,
  DEFAULT_ANNOUNCEMENT_STATUS,
} from '../utils/constants.js';

/**
 * Validate that the specified role exists and belongs to the specified event, if relationships are present.
 */
export const validateRoleReference = async (eventId, roleId) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return { valid: true };

    const isObjectId = mongoose.Types.ObjectId.isValid(roleId);
    const role = await db.collection('roles').findOne({
      $or: [
        { _id: roleId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(roleId) }] : []),
      ],
    });

    if (role) {
      const roleEvent = role.event?.toString() || role.eventId?.toString();
      if (roleEvent && roleEvent !== eventId) {
        return {
          valid: false,
          message: 'Role does not belong to the specified event',
          code: 'INVALID_ROLE',
        };
      }
      return { valid: true };
    }

    const eventHasRoles = await db.collection('roles').countDocuments({
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

    if (eventHasRoles > 0) {
      return {
        valid: false,
        message: 'Role not found for this event',
        code: 'ROLE_NOT_FOUND',
      };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
};

/**
 * GET /api/events/:eventId/announcements
 * Retrieve announcements for an event with optional filters: zoneId, audience, priority, status.
 */
export const getAnnouncements = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { zoneId, audience, priority, status } = req.query;
    const filter = { eventId: eventId.trim() };

    if (zoneId !== undefined) {
      if (typeof zoneId !== 'string' || !zoneId.trim()) {
        return sendError(res, 'Zone ID filter cannot be empty', 'INVALID_FILTER', 400);
      }
      filter.zoneId = zoneId.trim();
    }

    if (audience !== undefined) {
      if (!ANNOUNCEMENT_AUDIENCES.includes(audience)) {
        return sendError(
          res,
          `Invalid audience filter. Allowed values: ${ANNOUNCEMENT_AUDIENCES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.audience = audience;
    }

    if (priority !== undefined) {
      if (!ANNOUNCEMENT_PRIORITIES.includes(priority)) {
        return sendError(
          res,
          `Invalid priority filter. Allowed values: ${ANNOUNCEMENT_PRIORITIES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.priority = priority;
    }

    if (status !== undefined) {
      if (!ANNOUNCEMENT_STATUSES.includes(status)) {
        return sendError(
          res,
          `Invalid status filter. Allowed values: ${ANNOUNCEMENT_STATUSES.join(', ')}`,
          'INVALID_FILTER',
          400
        );
      }
      filter.status = status;
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, announcements, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/announcements
 * Create an announcement for an event, validate audience targets, and log activity.
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return sendError(res, 'Invalid request body', 'INVALID_PAYLOAD', 400);
    }

    const { title, message, content, audience, zoneId, roleId, priority, status, createdBy } =
      payload;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return sendError(res, 'Announcement title is required', 'VALIDATION_ERROR', 400);
    }

    const actualMessage = message !== undefined ? message : content;
    if (!actualMessage || typeof actualMessage !== 'string' || !actualMessage.trim()) {
      return sendError(res, 'Announcement message is required', 'VALIDATION_ERROR', 400);
    }

    const selectedAudience = audience || DEFAULT_ANNOUNCEMENT_AUDIENCE;
    if (!ANNOUNCEMENT_AUDIENCES.includes(selectedAudience)) {
      return sendError(
        res,
        `Audience must be one of: ${ANNOUNCEMENT_AUDIENCES.join(', ')}`,
        'INVALID_AUDIENCE',
        400
      );
    }

    const selectedPriority = priority || DEFAULT_ANNOUNCEMENT_PRIORITY;
    if (!ANNOUNCEMENT_PRIORITIES.includes(selectedPriority)) {
      return sendError(
        res,
        `Priority must be one of: ${ANNOUNCEMENT_PRIORITIES.join(', ')}`,
        'INVALID_PRIORITY',
        400
      );
    }

    const selectedStatus = status || DEFAULT_ANNOUNCEMENT_STATUS;
    if (!ANNOUNCEMENT_STATUSES.includes(selectedStatus)) {
      return sendError(
        res,
        `Status must be one of: ${ANNOUNCEMENT_STATUSES.join(', ')}`,
        'INVALID_STATUS',
        400
      );
    }

    // Audience targeting validation: Zone requires zoneId
    if (selectedAudience === 'Zone') {
      if (!zoneId || typeof zoneId !== 'string' || !zoneId.trim()) {
        return sendError(
          res,
          'Zone ID is required when audience is Zone',
          'VALIDATION_ERROR',
          400
        );
      }
      const zoneValidation = await validateZoneReference(eventId.trim(), zoneId.trim());
      if (!zoneValidation.valid) {
        return sendError(res, zoneValidation.message, zoneValidation.code, 400);
      }
    }

    // Audience targeting validation: Role requires roleId
    if (selectedAudience === 'Role') {
      if (!roleId || typeof roleId !== 'string' || !roleId.trim()) {
        return sendError(
          res,
          'Role ID is required when audience is Role',
          'VALIDATION_ERROR',
          400
        );
      }
      const roleValidation = await validateRoleReference(eventId.trim(), roleId.trim());
      if (!roleValidation.valid) {
        return sendError(res, roleValidation.message, roleValidation.code, 400);
      }
    }

    const announcementData = {
      eventId: eventId.trim(),
      title: title.trim(),
      message: actualMessage.trim(),
      audience: selectedAudience,
      zoneId: selectedAudience === 'Zone' ? zoneId.trim() : null,
      roleId: selectedAudience === 'Role' ? roleId.trim() : null,
      priority: selectedPriority,
      status: selectedStatus,
      createdBy: typeof createdBy === 'string' && createdBy.trim() ? createdBy.trim() : 'Organizer',
    };

    const announcement = await Announcement.create(announcementData);

    // Record activity log
    await logActivity(
      eventId.trim(),
      'announcement_created',
      `Announcement created: ${announcement.title} (${announcement.priority}) for ${announcement.audience}`,
      {
        announcementId: announcement.id,
        audience: announcement.audience,
        priority: announcement.priority,
        zoneId: announcement.zoneId,
        roleId: announcement.roleId,
        entityType: 'Announcement',
        entityId: announcement.id,
      }
    );

    return sendSuccess(res, announcement, 201);
  } catch (error) {
    next(error);
  }
};
