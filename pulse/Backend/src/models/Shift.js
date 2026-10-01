import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'Event',
    },
    zone: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Zone',
    },
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
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

const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);

export default Shift;
