import mongoose from 'mongoose';
import Volunteer from '../models/Volunteer.js';
import { logActivity } from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events/:eventId/volunteers & GET /api/volunteers
 * List and filter volunteers.
 */
export const getVolunteers = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.query.eventId;
    const { status, skill, search, zone, shift } = req.query;

    const filter = {};

    if (eventId && eventId.trim()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(eventId.trim());
      filter.$or = [
        { eventId: eventId.trim() },
        { event: eventId.trim() },
        ...(isObjectId
          ? [
              { eventId: new mongoose.Types.ObjectId(eventId.trim()) },
              { event: new mongoose.Types.ObjectId(eventId.trim()) },
            ]
          : []),
        { eventId: null, event: null },
      ];
    }

    if (status) {
      filter.status = status.trim().toLowerCase();
    }

    if (skill) {
      filter.skills = { $regex: new RegExp(`^${skill.trim()}$`, 'i') };
    }

    if (zone) {
      filter.preferredZones = { $in: [zone.trim()] };
    }

    if (shift) {
      filter.availableShiftIds = { $in: [shift.trim()] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const volunteers = await Volunteer.find(filter).sort({ name: 1 });
    return sendSuccess(res, volunteers, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/volunteers/:volunteerId
 * Get single volunteer by ID.
 */
export const getVolunteerById = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
    const volunteer = await Volunteer.findOne({
      $or: [
        { _id: volunteerId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
      ],
    });

    if (!volunteer) {
      return sendError(res, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND', 404);
    }

    return sendSuccess(res, volunteer, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:eventId/volunteers & POST /api/volunteers
 * Create a new volunteer.
 */
export const createVolunteer = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.body?.eventId || req.body?.event;
    const { name, email, phone, skills, preferredZones, preferredZoneId, availableShiftIds, maxHours, notes, status } =
      req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Volunteer name is required', 'VALIDATION_ERROR', 400);
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return sendError(res, 'Volunteer email is required', 'VALIDATION_ERROR', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return sendError(res, 'Please provide a valid email address', 'VALIDATION_ERROR', 400);
    }

    // Check for duplicate email
    const existing = await Volunteer.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return sendError(res, 'Volunteer with this email already exists', 'DUPLICATE_EMAIL', 409);
    }

    const volunteer = await Volunteer.create({
      eventId: eventId ? eventId.toString().trim() : null,
      event: eventId || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      skills: Array.isArray(skills) ? skills : [],
      preferredZones: Array.isArray(preferredZones) ? preferredZones : (preferredZoneId ? [preferredZoneId] : []),
      preferredZoneId: preferredZoneId || null,
      availableShiftIds: Array.isArray(availableShiftIds) ? availableShiftIds : [],
      maxHours: typeof maxHours === 'number' ? maxHours : 40,
      notes: notes ? notes.trim() : '',
      status: status || 'available',
    });

    if (eventId) {
      await logActivity(
        eventId.toString().trim(),
        'volunteer_registered',
        `Volunteer registered: ${volunteer.name}`,
        {
          volunteerId: volunteer.id || volunteer._id.toString(),
          email: volunteer.email,
          skills: volunteer.skills,
        }
      );
    }

    return sendSuccess(res, volunteer, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/volunteers/:volunteerId
 * Update volunteer details.
 */
export const updateVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
    const volunteer = await Volunteer.findOne({
      $or: [
        { _id: volunteerId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
      ],
    });

    if (!volunteer) {
      return sendError(res, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND', 404);
    }

    const { name, email, phone, skills, preferredZones, availableShiftIds, status, notes, totalHours } = req.body || {};

    if (email && email.trim().toLowerCase() !== volunteer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendError(res, 'Please provide a valid email address', 'VALIDATION_ERROR', 400);
      }
      const existing = await Volunteer.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return sendError(res, 'Volunteer with this email already exists', 'DUPLICATE_EMAIL', 409);
      }
      volunteer.email = email.trim().toLowerCase();
    }

    if (name !== undefined) volunteer.name = name.trim();
    if (phone !== undefined) volunteer.phone = phone.trim();
    if (skills !== undefined) volunteer.skills = Array.isArray(skills) ? skills : [];
    if (preferredZones !== undefined) volunteer.preferredZones = preferredZones;
    if (availableShiftIds !== undefined) volunteer.availableShiftIds = availableShiftIds;
    if (status !== undefined) volunteer.status = status;
    if (notes !== undefined) volunteer.notes = notes;
    if (typeof totalHours === 'number') volunteer.totalHours = totalHours;

    await volunteer.save();
    return sendSuccess(res, volunteer, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/volunteers/:volunteerId
 * Delete volunteer by ID.
 */
export const deleteVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(volunteerId);
    const result = await Volunteer.findOneAndDelete({
      $or: [
        { _id: volunteerId },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(volunteerId) }] : []),
      ],
    });

    if (!result) {
      return sendError(res, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND', 404);
    }

    return sendSuccess(res, { message: 'Volunteer deleted successfully' }, 200);
  } catch (error) {
    next(error);
  }
};
