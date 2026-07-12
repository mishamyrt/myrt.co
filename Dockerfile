ARG NODE_VERSION=26
ARG PNPM_VERSION=11.6.0
ARG CADDY_VERSION=2.11.4

FROM node:$NODE_VERSION-alpine AS builder
WORKDIR /build
COPY src ./src
COPY plugins ./plugins
COPY public ./public
COPY \
  package.json pnpm-lock.yaml pnpm-workspace.yaml \
  tsconfig.json astro.config.ts \
  ./
RUN npm install -g pnpm@$PNPM_VERSION
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM caddy:$CADDY_VERSION-alpine
COPY --from=builder /build/dist /data
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
EXPOSE 443
