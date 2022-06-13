FROM nginx
RUN  rm -rf /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY src /usr/share/nginx/html
