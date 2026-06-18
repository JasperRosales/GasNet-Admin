export const unwrapRelation = <T>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? value[0] : value;
