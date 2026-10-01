import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
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
    },
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Shift start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Shift end time is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.startAt = ret.startTime;
        ret.endAt = ret.endTime;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.startAt = ret.startTime;
        ret.endAt = ret.endTime;
        delete ret.__v;
        return ret;
      },
    },
  }
);

shiftSchema.virtual('startAt').get(function () {
  return this.startTime;
}).set(function (val) {
  this.startTime = val;
});

shiftSchema.virtual('endAt').get(function () {
  return this.endTime;
}).set(function (val) {
  this.endTime = val;
});

const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);

export default Shift;
