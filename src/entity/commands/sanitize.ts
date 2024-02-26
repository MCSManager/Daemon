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

  // Remove specific dangerous commands
  const dangerousCommands = [
    'rm -rf',
    'rm -rf /',
    'sh',
    'mv /',
    'chmod -R 777',
    'chown -R',
    'dd if=/dev/zero',
    'mkfs'
  ];

  dangerousCommands.forEach(dc => {
    command = command.replace(new RegExp(dc, 'gi'), '');
  });

  return command;
}
