const { rmSync } = require('node:fs')
const { resolve } = require('node:path')

const directory = process.argv[2] === 'tests' ? '.test-dist' : 'dist'
rmSync(resolve(__dirname, '..', directory), { recursive: true, force: true })
