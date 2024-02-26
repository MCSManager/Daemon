export function sanitizeCommand(command: string): string {
  return command.replace(/\\([0-9a-fA-F]{2})|[\x00-\x1F\x7F-\x9F]|\\u([0-9a-fA-F]{4})|[|`]|\\/g, '').replace('..', '');
}
