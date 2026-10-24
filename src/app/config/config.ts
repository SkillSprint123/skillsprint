import {getConfigValue, getFeatures, getNavigationValue} from '@brojs/cli'

import pkg from '../../../package.json'
import {parseAppConfig} from './parse'

export const appConfig = parseAppConfig({
    basePath: getNavigationValue(`${pkg.name}.main`),
    apiBaseUrl: getConfigValue(`${pkg.name}.api`) || undefined,
    registryUrl: getConfigValue(`${pkg.name}.nanos`) || undefined,
    version: pkg.version,
    features: {
        aiInterview: getFeatures(pkg.name)?.['ai-interview']?.value,
    },
})
