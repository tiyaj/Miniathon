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
      index: true,
    },
    role: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Role',
      default: null,
    },
    roleId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'checked_in', 'completed', 'dropped', 'no_show', 'cancelled'],
      default: 'assigned',
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
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
      min: [0, 'Hours worked cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.checkInAt = ret.checkedInAt;
        ret.checkOutAt = ret.checkedOutAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.checkInAt = ret.checkedInAt;
        ret.checkOutAt = ret.checkedOutAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

assignmentSchema.virtual('checkInAt').get(function () {
  return this.checkedInAt;
}).set(function (val) {
  this.checkedInAt = val;
});

assignmentSchema.virtual('checkOutAt').get(function () {
  return this.checkedOutAt;
}).set(function (val) {
  this.checkedOutAt = val;
});

assignmentSchema.index({ shift: 1, role: 1, status: 1 });
assignmentSchema.index({ volunteer: 1, status: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment;
