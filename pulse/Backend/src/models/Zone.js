import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    coordinatorName: {
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

const Zone = mongoose.models.Zone || mongoose.model('Zone', zoneSchema);

export default Zone;
