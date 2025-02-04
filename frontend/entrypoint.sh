#!/bin/sh

set -e

# Mandatory environment variables, separated by space
VARIABLES="NEXT_PUBLIC_SERVER_URL NEXT_PUBLIC_GOOGLE_CLIENT_ID NEXT_PUBLIC_FRONTEND_URL"

# Optional environment variables, separated by space
OPTIONAL_VARIABLES=""

# Check and replace mandatory variables
for VAR in $VARIABLES; do
    if [ -z "$(eval echo \$$VAR)" ]; then
        echo "$VAR is not set. Please set it and rerun the script."
        exit 1
    else
        # Find and replace DOCKER values with real values for mandatory variables
        find /app/public /app/.next -type f -name "*.js" | while read file; do
            VALUE=$(eval echo \$$VAR)
            sed -i "s|DOCKER_$VAR|$VALUE|g" "$file"
        done
    fi
done

# Replace optional variables, if they are set
for VAR in $OPTIONAL_VARIABLES; do
    if [ ! -z "$(eval echo \$$VAR)" ]; then
        # Find and replace DOCKER values with real values for optional variables
        find /app/public /app/.next -type f -name "*.js" | while read file; do
            VALUE=$(eval echo \$$VAR)
            sed -i "s|DOCKER_$VAR|$VALUE|g" "$file"
        done
    fi
done

node server.js
