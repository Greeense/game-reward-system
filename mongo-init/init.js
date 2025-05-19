db = db.getSiblingDB('authdb'); // auth-server용 DB 선택
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
db2.reward.insertOne({
  userId: 'admin',
  eventId: 'event001',
  status: 'requested',
});

db2 = db2.getSiblingDB('eventdb');
db2.events.insertOne({
  eventId: 'event001',
  name: '출석 이벤트',
  condition: '하루 1회 접속 시',
  reward: '500 골드',
  startDate: new Date('2025-05-20T00:00:00Z'),
  endDate: new Date('2025-05-31T23:59:59Z'),
  createdAt: new Date(),
  status : true
});