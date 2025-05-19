import mongoose from 'mongoose';

const rewardRequestSchema = new mongoose.Schema({
    userId : String,
    eventId : String,
    status : String,
    cratedAt : {type : Date, default:Date.now},
});

export const RewardRequest =
    mongoose.models.RewardRequest ||
    mongoose.model('RewardRequest', rewardRequestSchema);