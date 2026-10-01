import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Activity message is required'],
      trim: true,
    },
    entityType: {
      type: String,
      default: null,
      trim: true,
    },
    entityId: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.action = ret.type;
        ret.description = ret.message;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.action = ret.type;
        ret.description = ret.message;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Reusable activity logger supporting both positional and object arguments.
 */
export const logActivity = async (eventId, typeOrData, message, metadata = {}) => {
  try {
    let payload = {};
    if (typeof typeOrData === 'object' && typeOrData !== null) {
      payload = {
        eventId: String(eventId).trim(),
        type: typeOrData.type || typeOrData.action || 'system_event',
        message: typeOrData.message || typeOrData.description || 'System activity',
        entityType: typeOrData.entityType || null,
        entityId: typeOrData.entityId || null,
        metadata: typeOrData.metadata || {},
      };
    } else {
      payload = {
        eventId: String(eventId).trim(),
        type: String(typeOrData).trim(),
        message: String(message || '').trim(),
        entityType: metadata?.entityType || null,
        entityId: metadata?.entityId || null,
        metadata: metadata || {},
      };
    }
    return await Activity.create(payload);
  } catch (error) {
    // Non-blocking for primary operations
    console.error('Failed to record activity log:', error.message);
    return null;
  }
};

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
