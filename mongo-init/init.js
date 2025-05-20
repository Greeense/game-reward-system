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
db2.events.insertOne({
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
db2.rewards.insertMany([
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

db2.usereventprogress.insertMany([
  {
    "_id": "6660eabb1d5f902d8c8b5678",
    "userId": "user123",
    "eventId": "665e99b063d761f218ed1234",
    "loginCount": 3,
    "consecutiveLoginCount": 2,
    "isCompleted": false,
    "updatedAt": "2024-05-27T02:00:00.000Z",
    "__v": 0
  },
  {
    "_id": "6660eabb1d5f902d8c8b5679",
    "userId": "user456",
    "eventId": "665e99b063d761f218ed1234",
    "loginCount": 5,
    "consecutiveLoginCount": 5,
    "isCompleted": true,
    "updatedAt": "2024-05-27T02:00:00.000Z",
    "__v": 0
  }
]);