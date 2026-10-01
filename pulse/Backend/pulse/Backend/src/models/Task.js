import mongoose from 'mongoose';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
} from '../utils/constants.js';

const taskSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
      index: true,
    },
    zoneId: {
      type: String,
      required: [true, 'Zone ID is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      },
      default: DEFAULT_TASK_PRIORITY,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      },
      default: DEFAULT_TASK_STATUS,
    },
    assigneeVolunteerId: {
      type: String,
      default: null,
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

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
