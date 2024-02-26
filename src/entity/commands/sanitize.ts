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
    'rm -r /',
    'rm -R /',
    'rm -rf /',
    'rm -Rf /',
    'rm -r -f /',
    'rm -R -f /',
    'rm -r -R /',
    'rm -rf -r /',
    'rm -r -rf /',
    'rm -Rf -r /',
    'rm -R -rf /',
    'rm -r -f -R /',
    'rm -R -f -r /',
    'rm -r -R -f /',
    'rm -rf -r -R /',
    'rm -r -rf -R /',
    'rm -Rf -r -f /',
    'rm -R -rf -r /',
    'rm -r -f -R -f /',
    'rm -R -f -r -f /',
    'sh',
    'sudo',
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
