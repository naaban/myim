#!/bin/sh


echo "Creating directory /var/www/html"
mkdir -p /var/www/html

CERT_DIR="/etc/letsencrypt/live/${DOMAIN}/cert.txt"


if [ ! -f "$CERT_DIR" ]; then
   echo "Generating SSL certificate for domain: $DOMAIN"
    if ! certbot certonly --webroot --webroot-path=/var/www/html -m "$EMAIL" --agree-tos --no-eff-email --force-renewal -d "$DOMAIN"; then
        echo "Failed to generate SSL certificate."
        exit 1
    fi
    echo "Certificate exists from Certbot" > $CERT_DIR


else
    echo "Certificate already exists for $DOMAIN. No need to generate a new one."
fi
