# Corgi-Template

This template demonstrates a way to build web API application on lambda with vingle-corgi
Initial sample is simple backend for service health system like https://status.slack.com/

# Commands

## npm run build
Build entities schema for open-api spec, also build TSC
```
    "build:corgi": "vingle-corgi build \"./src/api/entities/\"",
    "build:tsc": "rm -rf dst && tsc",
    "build": "npm run build:corgi && npm run build:tsc",
```

## npm run lint

## npm run deploy
npm run deploy:stage
npm run deploy:prod

## npm run info
npm run info:stage
npm run info:prod

# OpenAPI
This template automatically generates OpenAPI3.0 spec, which means you can generate API client
once you deploy the application with npm run deploy:prod or npm run deploy:stage, you'll get the url like this
https://p0iiz3t3ek.execute-api.us-east-1.amazonaws.com/stage/
than you can get the generated OpenAPI spec for https://p0iiz3t3ek.execute-api.us-east-1.amazonaws.com/stage/open-api


# CI
this repo supports both Github Actions / CircleCI
