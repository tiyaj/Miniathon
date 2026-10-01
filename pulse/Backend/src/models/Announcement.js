import mongoose from 'mongoose';
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_STATUSES,
  DEFAULT_ANNOUNCEMENT_PRIORITY,
  DEFAULT_ANNOUNCEMENT_AUDIENCE,
  DEFAULT_ANNOUNCEMENT_STATUS,
} from '../utils/constants.js';

const announcementSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
    },
    audience: {
      type: String,
      enum: {
        values: ANNOUNCEMENT_AUDIENCES,
        message: `Audience must be one of: ${ANNOUNCEMENT_AUDIENCES.join(', ')}`,
      },
      default: DEFAULT_ANNOUNCEMENT_AUDIENCE,
      trim: true,
    },
    zoneId: {
      type: String,
      default: null,
      trim: true,
    },
    roleId: {
      type: String,
      default: null,
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ANNOUNCEMENT_PRIORITIES,
        message: `Priority must be one of: ${ANNOUNCEMENT_PRIORITIES.join(', ')}`,
      },
      default: DEFAULT_ANNOUNCEMENT_PRIORITY,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ANNOUNCEMENT_STATUSES,
        message: `Status must be one of: ${ANNOUNCEMENT_STATUSES.join(', ')}`,
      },
      default: DEFAULT_ANNOUNCEMENT_STATUS,
      trim: true,
    },
    createdBy: {
      type: String,
      default: 'Organizer',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Announcement =
  mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

export default Announcement;
