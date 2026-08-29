export function uniqueSuffix(): string {
  return Date.now()
    .toString()
    .slice(-8);
}

export function repeated(
  length: number,
  character = 'A'
): string {
  return character.repeat(
    length
  );
}
