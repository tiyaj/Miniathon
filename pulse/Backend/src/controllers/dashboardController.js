import { getEventDashboard } from '../services/dashboardService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/events/:eventId/dashboard
 * Consolidated dashboard aggregation endpoint for an event.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !eventId.trim()) {
      return sendError(res, 'Event ID is required', 'INVALID_EVENT_ID', 400);
    }

    const dashboard = await getEventDashboard(eventId);
    return sendSuccess(res, dashboard, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code || 'BAD_REQUEST', error.statusCode);
    }
    next(error);
  }
};
