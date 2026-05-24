import mongoose from 'mongoose';
import { RoleNamesArray } from '../../constants.js';

const { Schema } = mongoose;

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

const inviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email format is invalid.'],
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: RoleNamesArray,
      default: 'staff',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

inviteSchema.statics.defaultExpiresAt = function defaultExpiresAt() {
  return new Date(Date.now() + INVITE_TTL_MS);
};

export { INVITE_TTL_MS };
export default mongoose.model('Invite', inviteSchema);
