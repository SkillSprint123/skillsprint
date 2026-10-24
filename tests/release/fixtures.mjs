export const createSources = () => ({
  schemaVersion: 1,
  nanos: Object.fromEntries(
    ['learning-plan', 'trainer', 'interview', 'progress'].map((id) => [
      id,
      {
        version: '0.1.0',
        source: null,
        scripts: { check: 'check', build: 'build:prod' },
        output: 'dist',
        entry: 'index.js',
        styles: [],
      },
    ]),
  ),
})
