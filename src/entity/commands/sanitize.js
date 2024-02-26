export function sanitizeCommand(command: string): string {
  // Escape special characters that have special meaning in regular expressions
  command = command.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

  // Remove control characters and non-printable characters
  command = command.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Prevent path escaping
  command = command.replace(/\.\./g, '');

  return command;
}
