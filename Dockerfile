ARG NODE_VERSION=26
ARG PNPM_VERSION=11.6.0
ARG CADDY_VERSION=2.11

FROM node:$NODE_VERSION-alpine AS node-builder
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

FROM caddy:$CADDY_VERSION-builder AS caddy-builder

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    xcaddy build \
    --with github.com/caddyserver/nginx-adapter \
    --with github.com/hairyhenderson/caddy-teapot-module@v0.0.3-0

FROM caddy:$CADDY_VERSION-alpine
COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
COPY --from=node-builder /build/dist /data
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
EXPOSE 443
