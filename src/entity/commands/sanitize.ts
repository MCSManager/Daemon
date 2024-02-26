export function sanitizeCommand(command: string): string {
  // Remove control characters and non-printable characters
  command = command.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Remove special characters that could be used in exploits
  command = command.replace(/[|`\\]/g, '');

  // Prevent path traversal attacks by removing '..'
  command = command.replace(/\.\./g, '');

  // Remove escaped character sequences like \xHH and \uHHHH
  command = command.replace(/\\([0-9a-fA-F]{2})/g, '');

  // Remove Unicode escape sequences like \uHHHH
  command = command.replace(/\\u([0-9a-fA-F]{4})/g, '');

  return command;
}
