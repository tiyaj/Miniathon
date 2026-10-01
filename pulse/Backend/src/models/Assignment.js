import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
    volunteer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'Volunteer',
    },
    volunteerId: {
      type: String,
      index: true,
    },
    shift: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Shift',
      default: null,
    },
    shiftId: {
      type: String,
    },
    role: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Role',
      default: null,
    },
    roleId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['assigned', 'checked_in', 'completed', 'dropped', 'no_show', 'cancelled'],
      default: 'assigned',
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedOutAt: {
      type: Date,
      default: null,
    },
    hoursWorked: {
      type: Number,
      default: 0,
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

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment;
