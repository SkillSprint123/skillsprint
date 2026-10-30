const pkg = require('./package.json')
const NanoRegistryPlugin = require('./scripts/webpack-plugin.cjs')

module.exports = {
  apiPath: 'server/api',
  webpackConfig: {
    plugins: [new NanoRegistryPlugin()],
    module: {
      rules: [
        {
          // BroJS re-exports optional i18next helpers alongside its config API.
          // Allow Webpack to omit them when only the config API is imported.
          test: /[\\/]@brojs[\\/]i18nextreactconfig[\\/]index\.js$/,
          sideEffects: false,
        },
      ],
    },
    output: {
      filename:
        process.env.BROJS_OUTPUT_FILENAME || '[name].js?[contenthash:8]',
      chunkFilename:
        process.env.BROJS_OUTPUT_CHUNK_FILENAME ||
        '[name].chunk.js?[contenthash:8]',
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`,
    },
  },
  navigations: {
    'skillsprint.main': '/skillsprint',
  },
  features: {
    skillsprint: {
      'ai-interview': { value: true },
    },
  },
  config: {
    'skillsprint.api': '/api',
    // Optional override for stands without an accessible feature activation control.
    'skillsprint.ai-interview': '',
    // Empty value: nanos.json next to the current bundle, resolved using publicPath.
    'skillsprint.nanos': process.env.NANO_REGISTRY_URL || '',
  },
  htmlTemplatePath: undefined,
}
