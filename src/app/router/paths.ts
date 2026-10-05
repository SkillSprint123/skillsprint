export const joinRoute = (basePath: string, section: string): string =>
  `${basePath === '/' ? '' : basePath}/${section}`
