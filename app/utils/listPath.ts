export function listPath(path: string, page: number): string {
  if (page <= 1) {
    return path
  }

  return `${path}?page=${String(page)}`
}
