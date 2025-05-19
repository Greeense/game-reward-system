import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

function getMongoUri(): string {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 환경변수가 없어요');
  }
  return MONGODB_URI;
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = getMongoUri(); // TypeScript는 여기서 string으로 확정됨
  await mongoose.connect(uri);
  console.log('MongoDB 연결 성공');
}
