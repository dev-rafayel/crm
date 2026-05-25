import mongoose from 'mongoose';

const { Schema } = mongoose;

const clientSchema = new Schema(
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
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email format is invalid.'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Phone number must be in international E.164 format with minimum 7 digits.'],
    },
    status: {
      type: String,
      enum: ['hot', 'warm', 'cold'],
      default: 'cold',
    },
    position: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    added: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model('Client', clientSchema);
