FROM caddy:alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY ./dist /data
