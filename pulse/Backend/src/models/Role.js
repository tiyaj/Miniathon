import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'Event',
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
    },
    requiredCount: {
      type: Number,
      default: 1,
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
