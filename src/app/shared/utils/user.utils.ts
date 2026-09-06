export function assigneeHandle(name: string): string {
  return `@${name.trim().split(/\s+/)[0]}`;
}
