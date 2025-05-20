import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },                         // 이벤트 제목
  condition: { type: String, required: true },                     // 조건 설명 (ex: 7일 연속 로그인)
  reward: { type: String, required: true },                        // 보상 요약 설명 (ex: 500포인트)
  startDate: { type: Date, required: true },                       // 시작일
  endDate: { type: Date, required: true },                         // 종료일
  createdBy: { type: String, required: true },                     // 생성자 ID (operator/admin)
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' } // 상태
});

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);