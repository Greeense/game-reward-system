import mongoose from 'mongoose';

const rewardRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },                        // 요청자 ID
  eventId: { type: String, required: true },                       // 대상 이벤트 ID
  reward: {                                                       // 실제 요청한 보상 정보
    type: {
      type: String,
      enum: ['point', 'item', 'coupon'],
      required: true
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true }  // 보상 값 (ex: 숫자, 아이템명, 쿠폰코드)
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: { type: Date, default: Date.now },
  handledBy: { type: String },                                     // operator ID (보상 처리자)
  handledAt: { type: Date }
});

export const RewardRequest = mongoose.models.RewardRequest || mongoose.model('RewardRequest', rewardRequestSchema);