FROM nginx:alpine
RUN rm -R /etc/nginx/conf.d
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./static/ /usr/share/nginx/html
