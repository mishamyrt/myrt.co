FROM node:16 as builder
COPY . .
RUN npm ci
RUN npm run build

FROM caddy:alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder ./dist /data
