db = db.getSiblingDB('authdb'); // auth-server용 DB 선택
// 역할별 유저
db.users.insertOne({
  userid : 'admin01',
  username: '관리자01',
  password: '1234',
  role: 'admin',
});

db.users.insertOne({
  userid : 'user01',
  username: '이승은',
  password: '1234',
  role: 'user',
});

db.users.insertOne({
  userid : 'audi01',
  username: '감사01',
  password: '1234',
  role: 'auditor',
});

db.users.insertOne({
  userid : 'operator01',
  username: '운영자01',
  password: '1234',
  role: 'operator',
});

db2 = db.getSiblingDB('eventdb'); // event-server용 DB 선택

// 이벤트 생성
const eventId = ObjectId();
db.events.insertOne({
  _id: eventId,
  title: '7일 연속 로그인 보상 이벤트',
  condition: '7일 연속 로그인',
  reward: '500 포인트',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-30'),
  createdBy: 'admin01',
  createdAt: new Date(),
  status: 'upcoming'
});

//  보상 등록
db.rewards.insertMany([
  {
    eventId: eventId,
    type: 'point',
    value: 500,
    description: '7일 연속 로그인 시 500 포인트 지급',
    createdBy: 'admin01',
    createdAt: new Date()
  },
  {
    eventId: eventId,
    type: 'coupon',
    value: 'WELCOME500',
    description: '쿠폰 보상: 신규 유저 대상',
    createdBy: 'admin01',
    createdAt: new Date()
  }
]);