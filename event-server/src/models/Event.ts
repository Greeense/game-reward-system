import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventId : {type : String, required : true, unique : true}, //고유 이벤트 식별자
    name : {type : String, required : true}, //이벤트 이름
    condition : {type : String, required:true}, //조건
    reward : {type : String, required : true}, //보상
    startDate: { type: Date, required: true }, // 이벤트 시작일
    endDate: { type: Date, required: true },
    createdAt : {type :Date, default : Date.now}, //이벤트 생성 시작
    status : {type : Boolean, default : true}
});

export const Event =
    mongoose.models.Event || mongoose.model('Event', eventSchema);