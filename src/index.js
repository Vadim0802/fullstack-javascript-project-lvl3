import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';
import prettier from 'prettier';
import { buildFilenameFromUrl, convertAssetUrls } from './utils.js';

const buildPromise = (link, assetFilepath) => {
  const { dir } = path.parse(assetFilepath);
  return fs.mkdir(dir, { recursive: true })
    .then(() => axios.get(link, { responseType: 'arraybuffer' }))
    .then(({ data: buffer }) => fs.writeFile(assetFilepath, buffer, 'binary'));
};

export default (link, dirpath) => {
  const urlInstance = new URL(link);
  const resourceFilename = buildFilenameFromUrl(link, '.html');
  const assetsDirname = buildFilenameFromUrl(link, '_files');
  const resourceFilepath = path.resolve(dirpath, resourceFilename);

  return axios.get(link)
    .then(({ data }) => {
      const { assetUrls, html } = convertAssetUrls(data, urlInstance.origin, assetsDirname);
      assetUrls.map(({ assetUrl, assetFilepath }) => buildPromise(
        assetUrl,
        path.join(dirpath, assetFilepath),
      ));

      const prettifyHtml = prettier.format(html, { parser: 'html' });
      return fs.writeFile(resourceFilepath, prettifyHtml, 'utf-8');
    })
    .then(() => resourceFilepath);
};
