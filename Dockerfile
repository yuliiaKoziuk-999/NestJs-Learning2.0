# Build stage
FROM node:24.2.0-alpine3.21 AS build

WORKDIR /app

RUN apk update && apk upgrade

COPY package*.json ./
COPY prisma ./prisma
RUN npx prisma generate

RUN npm ci --omit=dev

COPY . .

RUN npm run build

# Production stage
FROM node:24.2.0-alpine3.21 AS production

WORKDIR /app

RUN apk update && apk upgrade

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.env ./

EXPOSE 3000

CMD ["node", "dist/main"]
