import Activity from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events/:eventId/activity
 * Retrieve recent activity records for an event, sorted newest first.
 * Does NOT generate new activity logs on read.
 */
export const getActivity = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const query = { eventId: eventId.trim() };
    let activityQuery = Activity.find(query).sort({ createdAt: -1 });

    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        activityQuery = activityQuery.limit(parsedLimit);
      }
    }

    const activities = await activityQuery;
    return sendSuccess(res, activities, 200);
  } catch (error) {
    next(error);
  }
};
