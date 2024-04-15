ARG NODE_VERSION=21-alpine
ARG PNPM_VERSION=8.13.1
ARG CADDY_VERSION=2.7-alpine

FROM node:$NODE_VERSION as builder
WORKDIR /build
COPY src ./src
COPY public ./public
COPY \
  package.json pnpm-lock.yaml \
  tsconfig.json astro.config.mjs \
  ./
RUN npm install -g pnpm@$PNPM_VERSION
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM caddy:$CADDY_VERSION
COPY --from=builder /build/dist /data
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
EXPOSE 443
