FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache libstdc++ tini

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/src/main.js"]
