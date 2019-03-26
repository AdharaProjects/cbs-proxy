SHELL := /bin/bash
DOCKER_IMAGE_NAME ?= adharaprojects/cbs-proxy
DOCKER_IMAGE_TAG ?= latest
BRANCH_NAME=$(shell git rev-parse --abbrev-ref HEAD)
CURRENT_DATE=$(shell date '+%Y-%m-%d_%H-%M-%S')
COMMIT_SHORT_HASH=$(shell git rev-parse --short HEAD)
TAG_NAME=${BRANCH_NAME}_${CURRENT_DATE}_${COMMIT_SHORT_HASH}


.PHONY: test
test:
	scripts/test.sh


.PHONY: clean
clean:
	scripts/clean.sh


.PHONY: docker-build
docker-build:
	docker build -t ${DOCKER_IMAGE_NAME}:${COMMIT_SHORT_HASH} .


.PHONY: docker-publish-tag
docker-publish-tag:
	docker tag  ${DOCKER_IMAGE_NAME}:${COMMIT_SHORT_HASH} ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
	docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}


.PHONY: docker-publish
docker-publish:
	docker tag ${DOCKER_IMAGE_NAME}:${COMMIT_SHORT_HASH} ${DOCKER_IMAGE_NAME}:${TAG_NAME}
	docker push ${DOCKER_IMAGE_NAME}:${TAG_NAME}
