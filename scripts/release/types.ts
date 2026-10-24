export type RunCommand = (
  command: string,
  args: string[],
  cwd: string,
) => string
