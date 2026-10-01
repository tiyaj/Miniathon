import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    venue: {
      type: String,
      default: '',
      trim: true,
    },
    expectedAttendance: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'upcoming'],
      default: 'active',
      trim: true,
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

eventSchema.virtual('startAt').get(function () {
  return this.startTime;
}).set(function (val) {
  this.startTime = val;
});

eventSchema.virtual('endAt').get(function () {
  return this.endTime;
}).set(function (val) {
  this.endTime = val;
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;

eventSchema.virtual('location').get(function () {
  return this.venue;
}).set(function (val) {
  this.venue = val;
});
