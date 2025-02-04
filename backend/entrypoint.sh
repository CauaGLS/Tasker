#!/bin/bash

set -e

if [ "$#" -eq 0 ]; then
    exec daphne -p 8000 --bind 0.0.0.0 core.asgi:application
elif [ "$1" = "worker" ]; then
    exec celery -A core worker -E -l INFO --autoscale 4,8
elif [ "$1" = "beat" ]; then
    exec celery -A core beat -l INFO
else
    exec "$@"
fi