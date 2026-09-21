const test = require('node:test');
const assert = require('node:assert/strict');

function loadConfigModule() {
  const path = require.resolve('../app.config.js');
  delete require.cache[path];
  return require('../app.config.js');
}

test('injects EAS build project id from the build environment', () => {
  const previous = process.env.EAS_BUILD_PROJECT_ID;
  process.env.EAS_BUILD_PROJECT_ID = '11111111-2222-3333-4444-555555555555';

  try {
    const configure = loadConfigModule();
    const output = configure({
      config: {
        name: 'Kharcha',
        slug: 'kharcha',
        extra: { featureFlag: true },
      },
    });

    assert.equal(output.extra.featureFlag, true);
    assert.equal(
      output.extra.eas.projectId,
      '11111111-2222-3333-4444-555555555555',
    );
  } finally {
    if (previous === undefined) delete process.env.EAS_BUILD_PROJECT_ID;
    else process.env.EAS_BUILD_PROJECT_ID = previous;
  }
});

test('preserves an existing project id outside EAS Build', () => {
  const previous = process.env.EAS_BUILD_PROJECT_ID;
  delete process.env.EAS_BUILD_PROJECT_ID;

  try {
    const configure = loadConfigModule();
    const output = configure({
      config: {
        name: 'Kharcha',
        slug: 'kharcha',
        extra: { eas: { projectId: 'existing-project-id' } },
      },
    });

    assert.equal(output.extra.eas.projectId, 'existing-project-id');
  } finally {
    if (previous !== undefined) process.env.EAS_BUILD_PROJECT_ID = previous;
  }
});
