// https://ru.hexlet.io/courses ---> ru-hexlet-io-courses.html
// https://ru.hexlet.io/courses ---> ru-hexlet-io-courses_files

// /assets/professions/nodejs.png --->
// https://ru.hexlet.io/assets/professions/nodejs.png --->
// ru-hexlet-io-assets-professions-nodejs.png --->
// ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png

export const buildFilenameFromUrl = (link, prefix = '') => {
  const urlObj = new URL(link);
  return `${urlObj.hostname}${urlObj.pathname === '/' ? '' : urlObj.pathname}`
    .replace(/[^0-9a-zA-Z]/g, '-')
    .concat(prefix);
};

export const buildAssetFilenameFromUrl = (link) => {
  const extension = link.slice(link.lastIndexOf('.'));
  const formatted = buildFilenameFromUrl(link);
  return formatted.slice(0, formatted.lastIndexOf('-')).concat(extension);
};
