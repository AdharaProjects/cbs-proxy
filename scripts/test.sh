#!/bin/sh
set -e

# Create virtual network for tests
docker network create cyclos-cbs-proxy-test

# Start cyclos
docker run --name cyclos-db --network=cyclos-cbs-proxy-test \
      -e POSTGRES_DB=cyclos \
      -e POSTGRES_USER=cyclos \
      -e POSTGRES_PASSWORD=cyclospwd \
      -d adharaprojects/cyclos:cash_tokenizer_1

docker run --name cyclos --network=cyclos-cbs-proxy-test \
      -e DB_HOST=cyclos-db \
      -e DB_NAME=cyclos \
      -e DB_USER=cyclos \
      -e DB_PASSWORD=cyclospwd \
      -p "4001:8080" \
      -d cyclos/cyclos

docker build -t adharaprojects/cbs-proxy:temp-ci-test .
# TODO: use the `cyclos-cbs-proxy-test` network and use port 8080 instead then (do this when you have a proper config file)
docker run --name cbs-proxy \
              --network=host \
              -e API_SERVER_PORT=3033 \
              -e CBS_API_ADDRESS=http://localhost:4001 \
              -d adharaprojects/cbs-proxy:temp-ci-test

# Wait for Cyclos to be ready
sleep 40



docker exec cbs-proxy npm test -e API_SERVER_PORT=3033 -e CBS_API_ADDRESS=http://localhost:4001
