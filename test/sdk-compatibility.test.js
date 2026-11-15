const test = require('node:test');
const assert = require('node:assert/strict');

test('the published runtime rejects Linux before trying to connect to Chrome', async () => {
  const {connectLocalChrome} = require('linkout-scraper/lib/browser/connect-local-chrome');
  await assert.rejects(connectLocalChrome({
    platform: 'linux',
    puppeteer: {connect() {throw new Error('Must not connect');}},
  }), error => error.code === 'UNSUPPORTED_DEVICE');
});

test('published scraper registers its read-only tools with the patched SDK', async () => {
  const {McpServer} = await import('@modelcontextprotocol/sdk/server/mcp.js');
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const {z} = await import('zod');
  const {createMcpServer} = require('linkout-scraper/lib/mcp/server');
  const {TOOL_DEFINITIONS} = require('linkout-scraper/lib/mcp/tool-definitions');
  const handlers = Object.fromEntries(TOOL_DEFINITIONS.map(tool => [tool.name,
    async () => ({content: [{type: 'text', text: 'synthetic'}]})]));
  const server = createMcpServer({McpServer, z, handlers});
  const client = new Client({name: 'compatibility-test', version: '1.0.0'});
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const {tools} = await client.listTools();
    assert.equal(tools.length, 8);
    assert.ok(tools.every(tool => tool.annotations.readOnlyHint === true));
  } finally {
    await Promise.all([client.close(), server.close()]);
  }
});
