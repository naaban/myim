FROM certbot/certbot

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/bin/sh", "-c", "/entrypoint.sh", "$DOMAIN" ,"$EMAIL"]

# RUN /entrypoint.sh
