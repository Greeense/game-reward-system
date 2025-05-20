FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG JWT_SECRET

# 런타임 ENV 주입
ENV JWT_SECRET=$JWT_SECRET

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

