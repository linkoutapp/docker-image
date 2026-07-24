const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function maybeRead(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

test("package targets the current Linkout scraper runtime", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.engines.node, ">=22");
  assert.equal(pkg.dependencies["linkout-scraper"], "2.0.0");
  assert.equal(pkg.scripts.start, "linkout-mcp");
  assert.equal(pkg.scripts.test, "node --test");

  assert.equal(Object.hasOwn(pkg.dependencies, "puppeteer"), false);
  assert.equal(Object.hasOwn(pkg.dependencies, "puppeteer-extra"), false);
  assert.equal(Object.hasOwn(pkg.dependencies, "puppeteer-extra-plugin-stealth"), false);
  assert.equal(Object.hasOwn(pkg.dependencies, "dotenv"), false);
  assert.equal(Object.hasOwn(pkg.dependencies, "express"), false);
});

test("docker image is a Node 22 MCP package image without embedded credentials or Chrome", () => {
  const dockerfile = read("Dockerfile");

  assert.match(dockerfile, /^FROM node:22/m);
  assert.match(dockerfile, /CMD \["npm", "start"\]/);
  assert.doesNotMatch(dockerfile, /google-chrome|chromium|puppeteer/i);
  assert.doesNotMatch(dockerfile, /COPY \.env/i);
  assert.doesNotMatch(dockerfile, /USER root/i);
});

test("legacy cloud automation and removed services are absent", () => {
  const runtime = [
    maybeRead("README.md"),
    maybeRead("test.server.js"),
    maybeRead("test.example.js"),
  ].join("\n");

  assert.doesNotMatch(runtime, /loginWithEmail|services\.login|send2FA/i);
  assert.doesNotMatch(runtime, /salesNav|sales_nav/i);
  assert.doesNotMatch(runtime, /setCookie|li_at|EMAIL|PASSWORD/i);
  assert.doesNotMatch(runtime, /StealthPlugin|puppeteer-extra|webdriver|setUserAgent/i);
});

test("readme documents the latest read-only MCP surface", () => {
  const readme = read("README.md");

  assert.match(readme, /linkout-scraper@2\.0\.0/);
  assert.match(readme, /read-only MCP/i);
  assert.match(readme, /LINKOUT_CHROME_URL/);
  assert.match(readme, /does not run headless Chrome/i);
  assert.match(readme, /does not copy \.env/i);
});
