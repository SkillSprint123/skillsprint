const pkg = require('./package.json')
const NanoRegistryPlugin = require('./scripts/webpack-plugin.cjs')

module.exports = {
  apiPath: 'server/api',
  webpackConfig: {
    plugins: [new NanoRegistryPlugin()],
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`,
    },
  },
  navigations: {
    'skillsprint.main': '/skillsprint',
  },
  features: {
    skillsprint: {
      'ai-interview': { value: 'false' },
    },
  },
  config: {
    'skillsprint.api': '/api',
    // Пустое значение: nanos.json рядом с текущим bundle, с учётом publicPath.
    'skillsprint.nanos': process.env.NANO_REGISTRY_URL || '',
  },
  htmlTemplatePath: undefined,
}
