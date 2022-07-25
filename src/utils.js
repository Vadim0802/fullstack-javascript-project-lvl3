import url from 'url';

/* eslint-disable import/prefer-default-export */
export const buildResourceFilename = (resourceUrl) => {
  const { hostname, pathname } = url.parse(resourceUrl);
  return `${hostname}${pathname}`.replace(/[^0-9a-zA-Z]/g, '-').concat('.html');
};
