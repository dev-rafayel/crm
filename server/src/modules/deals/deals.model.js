import mongoose from 'mongoose';

const { Schema } = mongoose;

const dealSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stage: {
      type: String,
      enum: ['new', 'inProgress', 'negotiation', 'closed'],
      default: 'new',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** @deprecated use managerId — kept for legacy documents */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export default mongoose.model('Deal', dealSchema);
