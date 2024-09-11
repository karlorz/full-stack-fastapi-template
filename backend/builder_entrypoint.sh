#!/bin/sh

# Start the Docker daemon in the background
/usr/local/bin/dockerd-entrypoint.sh &

# Wait for Docker daemon to start
while (! docker stats --no-stream ); do
    echo "Waiting for Docker to launch..."
    sleep 1
done

# Run your Python application
uvicorn app.docker_builder:app --host 0.0.0.0 --port 8080
