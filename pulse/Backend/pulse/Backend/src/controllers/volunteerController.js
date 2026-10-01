import mongoose from 'mongoose';
import Volunteer from '../models/Volunteer.js';
import { logActivity } from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events/:eventId/volunteers
 * List and filter volunteers.
 */
export const getVolunteers = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { status, skill } = req.query;
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);

    const filter = {
      $or: [
        { eventId: eventId.trim() },
        { event: eventId.trim() },
        ...(isObjectId
          ? [
              { eventId: new mongoose.Types.ObjectId(eventId.trim()) },
              { event: new mongoose.Types.ObjectId(eventId.trim()) },
            ]
          : []),
        // If volunteers are global/unassigned to specific event, include general pool
        { eventId: null, event: null },
      ],
    };

    if (status) {
      filter.status = status;
    }

    if (skill) {
      filter.skills = { $in: [skill] };
    }

    const volunteers = await Volunteer.find(filter).sort({ name: 1 });
    return sendSuccess(res, volunteers, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/volunteers
 * Create a new volunteer for the event.
 */
export const createVolunteer = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const { name, email, phone, skills, preferredZones, availableShiftIds, notes } =
      req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Volunteer name is required', 'VALIDATION_ERROR', 400);
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return sendError(res, 'Volunteer email is required', 'VALIDATION_ERROR', 400);
    }

    const volunteer = await Volunteer.create({
      eventId: eventId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      skills: Array.isArray(skills) ? skills : [],
      preferredZones: Array.isArray(preferredZones) ? preferredZones : [],
      availableShiftIds: Array.isArray(availableShiftIds) ? availableShiftIds : [],
      notes: notes ? notes.trim() : '',
      status: 'available',
    });

    await logActivity(
      eventId.trim(),
      'volunteer_registered',
      `Volunteer registered: ${volunteer.name}`,
      {
        volunteerId: volunteer.id,
        email: volunteer.email,
        skills: volunteer.skills,
      }
    );

    return sendSuccess(res, volunteer, 201);
  } catch (error) {
    next(error);
  }
};
