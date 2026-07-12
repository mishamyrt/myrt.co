ARG NODE_VERSION=26-alpine
ARG PNPM_VERSION=11.6.0
ARG CADDY_VERSION=2.11-alpine

FROM node:$NODE_VERSION AS builder
WORKDIR /build
COPY src ./src
COPY public ./public
COPY \
  package.json pnpm-lock.yaml pnpm-workspace.yaml \
  tsconfig.json astro.config.ts \
  ./
RUN npm install -g pnpm@$PNPM_VERSION
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM caddy:$CADDY_VERSION
COPY --from=builder /build/dist /data
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
EXPOSE 443
