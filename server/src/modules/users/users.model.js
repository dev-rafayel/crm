import mongoose from 'mongoose';
import {
  RoleNames,
  RoleNamesArray,
  UserStatuses,
  UserStatusesArray,
  DefaultValues,
} from '../../constants.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    invite_token: {
      type: String,
    },
    firstName: {
      type: String,
      maxlength: 50,
      trim: true,
      match: [/^[\p{L}\s\-]+$/u, 'First name must contain only letters.'],
    },
    lastName: {
      type: String,
      maxlength: 50,
      trim: true,
      match: [/^[\p{L}\s\-]+$/u, 'Last name must contain only letters.'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email format is invalid.'],
    },
    password: {
      type: String,
      select: false,
    },
    profile_image: {
      type: String,
      default: DefaultValues.USER_PROFILE_IMAGE,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Phone number must be in international E.164 format with minimum 7 digits.'],
    },
    role: {
      type: String,
      enum: RoleNamesArray,
      default: RoleNames.STAFF,
    },
    status: {
      type: String,
      enum: UserStatusesArray,
      default: UserStatuses.ACTIVE,
    },
    // ---- НАШИ НОВЫЕ ПОЛЯ ДЛЯ ДАШБОРДА ----
    totalSales: {
      type: Number,
      default: 0, // Изначально у менеджера 0 продаж
    },
    graphColor: {
      type: String,
      default: '#3B82F6', // Дефолтный синий цвет
    }
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);