FROM nginx:alpine
RUN rm -R /etc/nginx/conf.d
COPY ./dist/nginx.conf /etc/nginx/nginx.conf
COPY ./dist/static/ /usr/share/nginx/html
