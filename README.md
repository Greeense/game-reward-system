# 🎯 MSA 게임 출석 이벤트 자동 보상 지급 시스템 - Backend 구성
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
│   │   ├── app/api/login/route.ts                 # 로그인 API
│   │   ├── app/api/signin/route.ts                # 회원가입 API
│   │   ├── app/api/profile/route.ts               # 유저정보 조회 API
│   │   ├── app/api/editUser/route.ts              # 유저정보 수정 API
│   │   ├── lib/mongo.ts                           # MongoDB 연결
│   │   ├── lib/response.ts                        # 응답 lib
│   │   └── models/User.ts                         # 유저 스키마
│   └── Dockerfile
├── event-server/
│   ├── src/
│   │   ├── app/api/events/route.ts                 # 이벤트 생성 및 목록 조회 API
│   │   ├── app/api/events/[id]/route.ts            # 이벤트 상세 조회 API
│   │   ├── app/api/my/auto-reward-request/route.ts # 유저 이벤트 보상 지급(자동) API
│   │   ├── app/api/my/reward-request/route.ts      # 유저 이벤트 보상 지급(수동) API
│   │   ├── app/api/reward-request/route.ts         # 유저 이벤트 보상 요청 조회 API
│   │   ├── app/api/rewards/route.ts                # 이벤트 보상 생성 및 조회 API
│   │   ├── lib/mongo.ts                            # MongoDB 연결
│   │   ├── lib/response.ts                         # 응답 lib
│   │   ├── models/Event.ts                         # 이벤트 스키마
│   │   ├── models/Reward.ts                        # 보상 스키마
│   │   ├── models/RewardRequest.ts                 # 이벤트 보상 요청 스키마
│   │   └── models/UserEventProgress.ts             # 유저별 이벤트 보상지급 진행 스키마
│   └── Dockerfile
├── gateway-server/
│   ├── src/
│   │   ├── app/api/auth/
│   │   │    ├── editUser/route.ts                  # 프록시 유저정보수정 API
│   │   │    ├── login/route.ts                     # 프록시 로그인 API
│   │   │    ├── profile/route.ts                   # 프록시 유저정보조회 API
│   │   │    └── signin/route.ts                    # 프록시 회원가입 API
│   │   ├── app/api/events/
│   │   │    ├── route.ts                           # 프록시 이벤트 생성 및 목록 조회 API
│   │   │    ├── [id]/route.ts                      # 프록시 이벤트 상세 조회 API
│   │   │    ├── my/auto-reward-request/route.ts    # 프록시 유저 이벤트 보상 지급 (자동) API
│   │   │    ├── my/reward-request/route.ts         # 프록시 유저 이벤트 보상 지급 (수동) API
│   │   │    ├── reward-request/route.ts            # 프록시 유저 이벤트 요청 조회 API
│   │   │    └── reward/route.ts                    # 프록시 보상 생성 및 조회 API
│   │   ├── lib/
│   │   │    └── response.ts                        # 응답 lib
│   │   └── middleware/
│   │        └── auth.ts                            # JWT 인증 미들웨어
│   └── Dockerfile   
├── docker-compose.yml
├── .env
├── README.md
└── mongo-init
   └── init.js                                     # DB별 기본 데이터 삽입


```

```txt
[Client]
   │
   ▼
[Gateway Server]  ← 인증 및 역할 필터링
   ├──> [Auth Server]   : 로그인, 회원가입, 토큰 발급
   └──> [Event Server]  : 이벤트 생성, 조건 검증, 보상 지급 처리
```

- ✅ 모든 요청은 **Gateway**를 통해 들어옴
- ✅ JWT 토큰 기반 인증
- ✅ 역할 기반 권한 처리 (`user`, `operator`, `admin`, `auditor`)
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
> 📍 기본 URL: `http://localhost:3000` (Gateway 기준)
---
## 🎯 핵심 기능

### ✅ 유저 기능
- `/api/my/auto-reward-request`: 조건 달성 시 자동 보상 요청
- `/api/my/reward-requests`: 수동 요청 등록 (승인 대기)
- `/api/reward-requests`: 본인의 보상 요청 이력 조회

### ✅ 운영자 / 관리자 기능
- `/api/events` `POST`: 이벤트 생성
- `/api/events` `GET`: 이벤트 목록 조회 (`?status=ongoing`)
- `/api/events/[id]`: 이벤트 상세 조회
- `/api/rewards`: 보상 등록 / 조회
- `/api/reward-requests`: 전체 요청 조회 (`status`, `eventId`, `userId` 필터링)

---
## 📐 API 디자인 철학

| 기준 | 설명 |
|------|------|
| 📦 **MSA 분리** | 기능별 서버로 분리해 유지보수성 향상 |
| 🔐 **JWT 인증** | 모든 요청은 토큰 기반으로 인증 |
| 🧑‍⚖️ **역할 제어** | `requireAuthWithRole()` 로 역할별 제어 |
| 📄 **명확한 응답 구조** | `success: boolean`, `message: string`, `data/result` 형태 통일 |
| 📈 **확장성 고려** | 추후 이벤트 유형 및 보상 방식 추가에 유연하게 대응 가능 |

---
## ⚠️ 주요 이슈 및 해결

| 이슈 | 해결 방식 |
|------|-----------|
| JWT 토큰 decode 타입 오류 | `as { userid: string, role: string }` 강제 타입 지정 |
| Gateway → Event 서버 POST body 전송 안됨 | `await req.text()`로 원문 body 추출 후 전달 |
| `_id → eventId` 명시 필요 | `.toObject()` 후 `{ eventId: _id }`로 변환 |
| 환경 변수 누락 문제 | `JWT_SECRET`, `EVENT_SERVER_URL` 등 명확하게 `.env` 및 `docker-compose`에 정의 필요 |

---
## 🧾 데이터 스키마 요약

### 📄 Event

| 필드 | 설명 |
|------|------|
| `title` | 이벤트 제목 |
| `condition` | 조건 설명 |
| `reward` | 보상 설명 (ex. 포인트 500점) |
| `startDate` / `endDate` | 이벤트 유효기간 |
| `createdBy` | 생성자 ID |
| `status` | `upcoming`, `ongoing`, `ended` |

### 🎁 Reward

| 필드 | 설명 |
|------|------|
| `eventId` | 연결된 이벤트 ID |
| `type` | `point` / `coupon` / `item` |
| `value` | 수치 또는 설명 |
| `createdBy` | 등록한 운영자 ID |

### 📬 RewardRequest

| 필드 | 설명 |
|------|------|
| `userId` | 요청자 |
| `eventId` | 대상 이벤트 |
| `status` | `pending` / `approved` / `rejected` |
| `reward` | 지급 보상 정보 |
| `handledBy` | `system` or 운영자 ID |
| `handledAt` | 처리 시점 |
| `requestedAt` | 요청 시간 |

---
## 🧾 API 명세 요약

### 🔐 인증 (Auth Server)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/signup` | 회원가입 |
| POST | `/api/login` | 로그인 (토큰 발급) |
| GET | `/api/profile` | 내 정보 조회 |
| PUT | `/api/profile` | 내 정보 수정 |

### 🎯 이벤트 & 보상 (Gateway → Event Server)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/events` | 이벤트 생성 |
| GET | `/api/events` | 이벤트 목록 조회 |
| GET | `/api/events/:id` | 이벤트 상세 조회 |
| POST | `/api/rewards` | 보상 등록 |
| GET | `/api/rewards` | 보상 목록 조회 |

### 🙋 보상 요청

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/my/auto-reward-request` | 자동 보상 요청 |
| POST | `/api/my/reward-requests` | 수동 요청 |
| GET | `/api/reward-requests` | 요청 이력 (권한별 필터링) |
