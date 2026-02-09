FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate
WORKDIR /app

FROM base AS development-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build-env
ARG VITE_API_BASE_URL=http://localhost:6064
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build-env /app/build /app/build
WORKDIR /app
EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "run", "start"]
