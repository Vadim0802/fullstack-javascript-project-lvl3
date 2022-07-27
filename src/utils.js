export const buildFilenameFromUrl = (link, prefix = '') => {
  const url = new URL(link);
  return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`
    .replace(/[^0-9a-zA-Z]/g, '-')
    .concat(prefix);
};

export const buildAssetFilenameFromUrl = (link) => {
  const url = new URL(link);
  const resource = `${url.origin}${url.pathname === '/' ? '' : url.pathname}`;
  const extension = resource.slice(link.lastIndexOf('.'));
  const formatted = buildFilenameFromUrl(resource);
  return formatted.slice(0, formatted.lastIndexOf('-')).concat(extension);
};
