export const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  for (const propName in obj) {
    if (obj[propName] === '__typename' || obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return obj
}
