# Linkout Docker Image

Docker packaging for `linkout-scraper@2.0.0`.

This image runs the Linkout read-only MCP server. It does not run headless Chrome. It does not copy .env, submit LinkedIn credentials, set cookies, spoof a browser fingerprint, use proxies, or expose removed Sales Nav and login services.

## Build

```sh
docker build -t linkout-mcp .
```

## Run

Linkout reads LinkedIn through an already signed-in visible Chrome session. Start Chrome on the host device and expose DevTools deliberately.

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --window-size=1440,900 \
  --user-data-dir="/absolute/path/to/linkout-chrome-profile" \
  https://www.linkedin.com/feed/
```

Run the MCP image with the Chrome endpoint configured:

```sh
docker run --rm -i \
  -e LINKOUT_CHROME_URL=http://127.0.0.1:9222 \
  linkout-mcp
```

Notes:

- `LINKOUT_CHROME_URL` must point to the approved visible Chrome session.
- On Docker Desktop, container access to host Chrome may require host networking or a host-gateway setup. Do not replace this with headless Chrome inside the container.
- Authentication stays in Chrome. The image does not contain credentials.

## Test

```sh
npm test
```
