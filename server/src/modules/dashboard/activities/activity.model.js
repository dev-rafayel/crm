import mongoose from 'mongoose';

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['client', 'deal', 'task', 'system'],
      default: 'client',
    },
  },
  { timestamps: true } // Нам автоматически создастся поле createdAt, которое мы используем для "5 min ago"
);

export default mongoose.model('Activity', activitySchema);