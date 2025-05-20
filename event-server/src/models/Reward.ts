import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { type: String, enum: ['point', 'item', 'coupon'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // 예: 숫자, 문자열
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true } // operator/admin ID
});

export const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);