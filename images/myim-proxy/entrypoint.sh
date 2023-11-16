#!/bin/sh

CERT_PATH="/etc/ssl/certs"
DH_PARAM_FILE="$CERT_PATH/dhparam.pem"

# Generate dhparam.pem file if it doesn't exist
if [ ! -f "$DH_PARAM_FILE" ]; then
    echo "Generating dhparam.pem file"
    if ! openssl dhparam -out "$DH_PARAM_FILE" 2048; then
        echo "Failed to generate dhparam.pem file"
        exit 1
    fi
fi



# Check for SSL certificates
if [  !  -f "$CERT_PATH/fullchain.pem" ] && [   !  -f "$CERT_PATH/private.key" ]; then
    # Step 1: Generate a private key
    openssl genrsa -out server.key 2048

    # Step 2: Create a Certificate Signing Request (CSR)
    openssl req -new -key server.key -out server.csr -subj "/CN=${DOMAIN}"

    # Step 3: Generate a self-signed certificate
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

    # Step 4: Create fullchain and privkey
    cat server.crt > /etc/ssl/certs/fullchain.pem
    cat server.key >>/etc/ssl/certs/fullchain.pem
    cp server.key /etc/ssl/certs/privkey.pem

fi

# Test the Nginx configuration
nginx -t

# Start Nginx
echo "Starting Nginx..."
nginx -g "daemon off;"