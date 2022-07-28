import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';
import prettier from 'prettier';
import Listr from 'listr';
import { buildFilenameFromUrl, convertAssetUrls } from './utils.js';

const buildPromise = (link, assetFilepath) => axios.get(link, { responseType: 'arraybuffer' })
  .then(({ data: buffer }) => fs.writeFile(assetFilepath, buffer, 'utf-8'));

export default (link, dirpath) => {
  const urlInstance = new URL(link);
  const resourceFilename = buildFilenameFromUrl(link, '.html');
  const assetsDirname = buildFilenameFromUrl(link, '_files');
  const resourceFilepath = path.join(dirpath, resourceFilename);

  const buildTasks = (urls) => new Listr([
    {
      title: 'Downloading assets.',
      task: () => {
        const tasks = new Listr(
          urls.map(({ assetUrl, assetFilepath }) => {
            const title = `Saving ${assetUrl}`;
            const promise = buildPromise(assetUrl, path.join(dirpath, assetFilepath));
            return {
              title,
              task: () => promise,
            };
          }),
          { concurrent: true, exitOnError: false },
        );

        return tasks;
      },
    },
  ]);

  return axios.get(link)
    .then(({ data }) => convertAssetUrls(data, urlInstance.origin, assetsDirname))
    .then(({ assetUrls, html }) => {
      const prettifyHtml = prettier.format(html, { parser: 'html' });
      return fs.writeFile(resourceFilepath, prettifyHtml, 'utf-8').then(() => assetUrls);
    })
    .then((assetUrls) => fs.mkdir(path.join(dirpath, assetsDirname))
      .then(() => buildTasks(assetUrls).run()))
    .then(() => resourceFilepath);
};
