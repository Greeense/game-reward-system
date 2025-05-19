# 🎯 MSA 게임 이벤트 보상 시스템 - Backend 구성
version : 1.0.0
## ✅ 기술 스택
- **Node.js 18**
- **Next.js (App Router)**
- **TypeScript**
- **MongoDB**
- **Docker & Docker Compose**

---

## 📁 프로젝트 구조

```
game-reward-system/
├── docker-compose.yml
├── auth-server/
│   ├── src/
│   │   ├── app/api/login/route.ts          # 로그인 API
│   │   ├── lib/mongo.ts                    # MongoDB 연결
│   │   └── models/User.ts                 # 유저 스키마
│   ├── Dockerfile
│   └── .env (선택)
├── event-server/
│   ├── src/
│   │   ├── app/api/reward-request/route.ts # 보상 요청 API
│   │   ├── lib/mongo.ts                    # MongoDB 연결
│   │   └── models/RewardRequest.ts        # 보상 요청 스키마
│   ├── Dockerfile
├── gateway-server/
│   ├── src/
│   │   ├── app/api/auth/login/route.ts     # 프록시 로그인 API
│   │   └── app/api/events/reward-request/route.ts # 프록시 보상 요청 API
│   ├── Dockerfile
```

---

## 🧱 각 서버 역할

| 서버 | 역할 |
|------|------|
| `gateway-server` | 모든 API 진입점, 요청을 각 서버로 프록시 |
| `auth-server`    | 유저 로그인, JWT 발급 처리 |
| `event-server`   | 보상 요청 처리, MongoDB에 저장 |
| `mongo`          | MongoDB 컨테이너 (공통 사용) |

---

## 🔧 docker-compose.yml 요약

```yaml
services:
  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  auth-server:
    build: ./auth-server
    ports:
      - "4000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/game

  event-server:
    build: ./event-server
    ports:
      - "5000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/eventdb

  gateway-server:
    build: ./gateway-server
    ports:
      - "3000:3000"
    environment:
      - AUTH_SERVER_URL=http://auth-server:3000
      - EVENT_SERVER_URL=http://event-server:3000

volumes:
  mongo-data:
```

---

## 🔑 인증 흐름

1. 클라이언트 → `POST /api/auth/login` 요청 (gateway-server)
2. gateway → auth-server로 프록시 요청 전달
3. auth-server → DB 검증 후 JWT 토큰 반환
4. 이후 클라이언트는 모든 요청에 `Authorization: Bearer <token>` 헤더 포함

---

## 🎁 보상 요청 흐름

1. 클라이언트 → `POST /api/events/reward-request` 요청
2. gateway → event-server로 토큰 포함 프록시
3. event-server에서 JWT 검증 + DB에 보상 요청 저장

---

## 🧪 실행 방법

```bash
# 1. 초기화 및 빌드
docker-compose down -v --rmi all

docker-compose up --build -d

# 2. 상태 확인
docker ps

# 3. 로그 확인
docker-compose logs auth-server
```

---

## ✅ 성공 로그 예시

```
💡 현재 MONGODB_URI: mongodb://mongo:27017/eventdb
✅ MongoDB 연결 성공
✅ JWT 발급 성공
✅ 보상 요청 생성됨
```

---

## 📦 테스트 시 주의
- `localhost` 대신 항상 `mongo` 사용 (Docker 내 통신)
- 환경변수는 docker-compose의 `environment:`에 지정
- `mongoose.connect(process.env.MONGODB_URI!)` 사용 전 존재 여부 확인 필수

---

## 🎉 당신은 지금까지...
✅ Docker 기반 MSA 서버 3개 완성  
✅ MongoDB 연동  
✅ JWT 기반 인증 완료  
✅ 모든 API 정상 빌드 완료!