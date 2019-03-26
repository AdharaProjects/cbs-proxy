#!/bin/sh
set -e

docker stop cyclos cyclos-db cbs-proxy
docker rm cyclos cyclos-db cbs-proxy
docker network rm cyclos-cbs-proxy-test
