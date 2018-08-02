# CBS-proxy

## Introduction

This is a simple proxy for any CBS that we may want to integrate into.
The basic interface of this proxy will remain standard regardless of the CBS it is being integrated into.
All components can communication with the CBS-proxy via the `cyclos-proxy-client`.
Thus the entire system is relatively easy to port to any CBS since changes for a given CBS are localised to this code.
This proxy can potentially play a larger role in the system in the future by using caching or other enhancements to an underlying CBS api.

## Getting started

### Installing

```
npm install
```

### Testing

1. Start Cyclos, for example run `TAG=basic_0 docker-compose up -d` inside the `cyclos-docker-adhara` repo.
2. Start the proxy with `npm run`
3. `npm test`

Note: you should set the environment variables to suit your needs for the test, this includes setting ports, and passwords and usernames for Cyclos.

~OR~

`circleci build` to run the CI tests locally.

Note: tests are far from comprehensive, lots more testing should be done.

### docker

eg:
```
docker run --name cbs-proxy \
  --network=host \
  -e API_SERVER_PORT=3033 \
  -e CBS_SERVER_ADDRESS=http://localhost:4000 \
  -d adharaprojects/cbs-proxy:0.0.0
```
