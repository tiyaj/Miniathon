import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'Event',
    },
    eventId: {
      type: String,
      index: true,
    },
    zone: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Zone',
      default: null,
    },
    zoneId: {
      type: String,
      default: null,
    },
    shift: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Shift',
      default: null,
    },
    shiftId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    capacity: {
      type: Number,
      default: 1,
      min: [1, 'Capacity must be at least 1'],
    },
    requiredCount: {
      type: Number,
      default: 1,
      min: [1, 'Required count must be at least 1'],
    },
    priority: {
      type: String,
      default: 'Medium',
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

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

export default Role;
