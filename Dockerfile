FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app
# ENV NODE_ENV production

# Install dependencies based on the preferred package manager
COPY package*.json yarn.lock ./
RUN yarn --frozen-lockfile
# --only=production;

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn generate
RUN yarn build


FROM base AS runner
WORKDIR /app
ARG DOCKER_USER=$DOCKER_USER
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# COPY --from=builder /app/public ./public
RUN chown nestjs:nestjs /app
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/*.json ./

# RUN yarn add -D tsconfig-paths

# RUN rm -rf /app/src


USER nestjs:nestjs
# USER ${UID}:${GID}
# USER nodejs:nodejs

EXPOSE 7000

ENV PORT=7000
ENV NODE_ENV=production
ENV HOST=kca_api
ENV DATABASE_URL="sqlserver://sql_server:1433;database=kca_db;integratedSecurity=true;username=sa;password=mast8118;trustServerCertificate=true"
ENV JWT_SECRET_KEY=kca-7000
ENV JWT_ACCESS_TOKEN="6h"
ENV JWT_REFRESH_TOKEN="2d"
ENV COOKIES_EXPIRED_DAY=3
ENV COOKIES_EXPIRED_TIME=8
ENV LOG_LEVEL="info"
ENV LOG_FILE_PATH='logs'
ENV MULTER_DESTINATION_PATH='./upload-files'
ENV MULTER_FILE_SIZE_LIMIT=2097152
ENV MULTER_FILES_LIMIT=2
ENV TZ=Asia/Makassar

# WORKDIR app/dist
CMD [ "sh", "-c", "yarn start:prod"]
# CMD [ "NODE_ENV=production", "node -r tsconfig-paths/register", "build/index.js"]

# echo 'export DOCKER_USER="$(id -u):$(id -g)"' >> ~/.bashrc
# source ~/.bashrc

# https://blog.giovannidemizio.eu/2021/05/24/how-to-set-user-and-group-in-docker-compose/
