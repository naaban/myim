FROM nginx


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# RUN mkdir -r /etc/ssl/certs
# RUN chmod -R +r /etc/ssl/certs
EXPOSE 80
EXPOSE 443

CMD ["/entrypoint.sh"]
