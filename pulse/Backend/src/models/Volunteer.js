import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Event',
      default: null,
    },
    eventId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Volunteer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Volunteer email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    preferredZones: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    preferredZoneId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    availableShiftIds: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    maxHours: {
      type: Number,
      default: 40,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'checked_in', 'checked_out', 'completed', 'dropout', 'no_show', 'dropped'],
      default: 'available',
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
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

const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
