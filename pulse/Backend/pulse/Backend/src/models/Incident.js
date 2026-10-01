import mongoose from 'mongoose';
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  DEFAULT_INCIDENT_SEVERITY,
  DEFAULT_INCIDENT_STATUS,
} from '../utils/constants.js';

const incidentSchema = new mongoose.Schema(
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
    type: {
      type: String,
      default: 'General',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    severity: {
      type: String,
      enum: {
        values: INCIDENT_SEVERITIES,
        message: `Severity must be one of: ${INCIDENT_SEVERITIES.join(', ')}`,
      },
      default: DEFAULT_INCIDENT_SEVERITY,
    },
    status: {
      type: String,
      enum: {
        values: INCIDENT_STATUSES,
        message: `Status must be one of: ${INCIDENT_STATUSES.join(', ')}`,
      },
      default: DEFAULT_INCIDENT_STATUS,
    },
    assignedCoordinator: {
      type: String,
      default: 'Event Lead',
      trim: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
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

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default Incident;
