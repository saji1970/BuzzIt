#!/usr/bin/env node

/**
 * Test to verify that the server reports the presence of the Railway IVS
 * configuration variables. Rather than hitting a deployed instance, the test
 * reads the configuration directly from the shared helper used by the API.
 *
 * Before running the test, inject the environment variables you'd expect to
 * receive from Railway (e.g. through `dotenv` or by exporting them).
 *
 * Usage:
 *   IVS_INGEST_RTMPS_URL=... IVS_STREAM_KEY=... npm test
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const serverEnvPath = path.join(__dirname, '..', 'server', '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  require('dotenv').config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

// Ensure we resolve the helper relative to the project root.
const { getLiveStreamConfig } = require(path.join(
  __dirname,
  '..',
  'server',
  'utils',
  'liveStreamConfig',
));

(() => {
  const config = getLiveStreamConfig();

  assert(
    typeof config === 'object' && config !== null,
    'Expected config to be an object.',
  );

  assert(
    config.hasIvsIngest,
    'IVS_INGEST_RTMPS_URL is missing or empty (hasIvsIngest=false).',
  );

  assert(
    config.hasIvsStreamKey,
    'IVS_STREAM_KEY is missing or empty (hasIvsStreamKey=false).',
  );

  assert(
    typeof config.ingestPreview === 'string' && config.ingestPreview.length > 0,
    'ingestPreview should be a non-empty string.',
  );

  assert(
    typeof config.streamKeyPreview === 'string' &&
      config.streamKeyPreview.length > 0,
    'streamKeyPreview should be a non-empty string.',
  );

  console.log('✅ Railway IVS environment variables detected.');
  console.log(`   Ingest preview: ${config.ingestPreview}`);
  console.log(`   Stream key preview: ${config.streamKeyPreview}`);
})();

