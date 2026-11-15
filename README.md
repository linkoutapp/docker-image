# Linkout Docker package

Container packaging for `linkout-scraper@2.0.0` and its read-only MCP server.

## Current runtime limitation

The published scraper runtime requires macOS and a loopback Chrome endpoint. A Linux container therefore stops with `UNSUPPORTED_DEVICE` before connecting to Chrome. Setting `LINKOUT_CHROME_URL`, enabling host networking, or using a host gateway does not remove that platform check.

Use the [native macOS setup](https://github.com/linkoutapp/linkout-scraper#usage) to run Linkout today. This repository can build and test the package image, but it does not provide a working Linux browser runtime.

The image does not run headless Chrome. It does not copy .env or browser state into the image, and it does not implement login or session export.

## Build

```sh
docker build -t linkout-mcp .
```

The image installs the committed dependency lock with `npm ci --omit=dev --ignore-scripts` and runs as the unprivileged `node` user. Docker must be installed locally to build it.

## Test the package

Use Node.js 22 or newer:

```sh
npm ci --ignore-scripts
npm test
npm audit
```

The tests use an in-memory MCP client/server pair to check the eight read-only tools. They do not start Chrome or connect to LinkedIn. The platform-boundary test confirms the published package rejects Linux.

## Dependency security

Targeted MCP SDK and Hono overrides patch the dependency tree of the published package. This does not add unreleased scraper source changes. Adopt a newer scraper release separately once it is published.
