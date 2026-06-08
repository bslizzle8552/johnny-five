export function withBasePath(path: string) {
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL;

  if (path.startsWith('/')) {
    return `${base}${path.slice(1)}`;
  }

  return `${base}${path}`;
}
