import mongoose from 'mongoose';

//user 스키마 정의
const userSchema = new mongoose.Schema({
    userid : String,
    username : String,
    password : String,
    role : {type : String, default : 'user'},

    //출석일 관련
    loginCount : {type : Number, default : 0}, //총 로그인 수
    consecutiveLoginCount : {type : Number, default : 0},//연속 로그인 수
    lastLoginDate : {type : Date, default:null}, //마지막 로그인 날짜
});

//이미 있으면 재사용(핫 리로드 중 오류 방지)
export const User = mongoose.models.User || mongoose.model('User',userSchema);

