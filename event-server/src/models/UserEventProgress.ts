import mongoose from 'mongoose';

const userEventProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  loginCount: Number,
  consecutiveLoginCount: Number,
  isCompleted: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

export const UserEventProgress =
  mongoose.models.UserEventProgress || mongoose.model('UserEventProgress', userEventProgressSchema);
