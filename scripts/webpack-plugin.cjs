const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

// Применяется и при прямом brojs build, и в dev/SPA-сборке.
class NanoRegistryPlugin {
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('NanoRegistryPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'NanoRegistryPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          let content = '{"schemaVersion":1,"nanos":{}}\n'
          const file = process.env.NANO_REGISTRY_FILE
          if (file) {
            const filename = resolve(file)
            compilation.fileDependencies.add(filename)
            content = readFileSync(filename, 'utf8')
            JSON.parse(content)
          }
          compilation.emitAsset(
            'nanos.json',
            new compiler.webpack.sources.RawSource(content),
          )
        },
      )
    })
    // BroJS CLI не проверяет stats.hasErrors(): CI должен получить ненулевой exit code.
    compiler.hooks.done.tap('NanoRegistryPlugin', (stats) => {
      if (stats.hasErrors()) process.exitCode = 1
    })
  }
}

module.exports = NanoRegistryPlugin
