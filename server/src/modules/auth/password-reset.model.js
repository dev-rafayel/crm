import mongoose from 'mongoose';

const { Schema } = mongoose;

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const passwordResetSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

passwordResetSchema.statics.defaultExpiresAt = function defaultExpiresAt() {
  return new Date(Date.now() + RESET_CODE_TTL_MS);
};

export { RESET_CODE_TTL_MS, MAX_ATTEMPTS };
export default mongoose.model('PasswordReset', passwordResetSchema);
