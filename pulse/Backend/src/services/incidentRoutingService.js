import mongoose from 'mongoose';

/**
 * Transparent rule-based routing for PULSE incidents.
 *
 * Routing Rules:
 * - Medical incident or First Aid zone -> 'Medical Coordinator'
 * - Entry Gate, Main Stage, or Parking -> 'Operations/Zone Coordinator'
 * - Missing or unknown coordinator -> 'Event Lead'
 *
 * @param {Object} params
 * @param {string} [params.type] - Category or type of incident (e.g. 'Medical', 'Crowd Surge')
 * @param {string} [params.zoneId] - Zone identifier (ObjectId or slug/name)
 * @param {string} [params.eventId] - Event identifier
 * @param {Object} [params.zone] - Optional resolved zone document from database
 * @returns {Promise<string>} Assigned coordinator title or name
 */
export const routeIncident = async ({ type = '', zoneId = '', eventId = '', zone = null } = {}) => {
  let resolvedZone = zone;

  // Resolve zone from database if not explicitly provided
  if (!resolvedZone && zoneId) {
    try {
      const db = mongoose.connection.db;
      if (db) {
        const isObjectId = mongoose.Types.ObjectId.isValid(zoneId);
        resolvedZone = await db.collection('zones').findOne({
          $or: [
            { _id: zoneId },
            ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(zoneId) }] : []),
          ],
        });
      }
    } catch {
      // Non-fatal, fallback to identifier analysis
    }
  }

  const normalizedType = String(type || '').toLowerCase().trim();
  const zoneName = String(resolvedZone?.name || '').toLowerCase().trim();
  const normalizedZoneId = String(zoneId || '').toLowerCase().trim();

  // Rule 1: Medical incident or First Aid zone
  const isMedicalType =
    normalizedType.includes('medical') ||
    normalizedType.includes('first aid') ||
    normalizedType.includes('injury') ||
    normalizedType.includes('cpr') ||
    normalizedType.includes('paramedic');

  const isMedicalZone =
    zoneName.includes('first aid') ||
    zoneName.includes('medical') ||
    normalizedZoneId.includes('first-aid') ||
    normalizedZoneId.includes('firstaid') ||
    normalizedZoneId.includes('medical');

  if (isMedicalType || isMedicalZone) {
    return 'Medical Coordinator';
  }

  // Rule 2: Entry Gate, Main Stage, or Parking zones (or operations coordinator)
  if (resolvedZone?.coordinatorName) {
    return resolvedZone.coordinatorName;
  }

  const isOpsZone =
    zoneName.includes('entry') ||
    zoneName.includes('gate') ||
    zoneName.includes('stage') ||
    zoneName.includes('parking') ||
    normalizedZoneId.includes('entry') ||
    normalizedZoneId.includes('gate') ||
    normalizedZoneId.includes('stage') ||
    normalizedZoneId.includes('parking');

  const isOpsType =
    normalizedType.includes('crowd') ||
    normalizedType.includes('surge') ||
    normalizedType.includes('queue') ||
    normalizedType.includes('security') ||
    normalizedType.includes('logistics');

  if (isOpsZone || isOpsType) {
    return 'Operations/Zone Coordinator';
  }

  // Rule 3: Missing or unknown coordinator falls back to Event Lead
  return 'Event Lead';
};

export default {
  routeIncident,
};
