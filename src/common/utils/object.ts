export function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
