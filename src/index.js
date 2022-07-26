import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';
import prettier from 'prettier';
import * as cheerio from 'cheerio';
import { buildAssetFilenameFromUrl, buildFilenameFromUrl } from './utils.js';

const buildPromise = (link, assertFilepath) => {
  const { dir } = path.parse(assertFilepath);
  return fs.mkdir(dir, { recursive: true })
    .then(() => axios.get(link, { responseType: 'arraybuffer' }))
    .then(({ data: buffer }) => fs.writeFile(assertFilepath, buffer, 'binary'));
};

export default (link, dirpath) => {
  const urlInstance = new URL(link);
  const resourceFilename = buildFilenameFromUrl(link, '.html');
  const resourceFilepath = path.resolve(dirpath, resourceFilename);
  const assertsDirname = buildFilenameFromUrl(link, '_files');
  const assertsDirpath = path.resolve(dirpath, assertsDirname);

  return axios.get(link)
    .then(({ data }) => {
      const $ = cheerio.load(data);

      $('img').each((_, node) => {
        const assertUrl = `${urlInstance.origin}${node.attribs.src}`;
        const assertFilepath = path.join(assertsDirpath, buildAssetFilenameFromUrl(assertUrl));
        buildPromise(assertUrl, assertFilepath);
        const { base } = path.parse(assertFilepath);
        const src = `${assertsDirname}/${base}`;
        $(node).attr('src', src);
      });

      const prettifyHtml = prettier.format($.html(), { parser: 'html' });
      return fs.writeFile(resourceFilepath, prettifyHtml, 'utf-8');
    })
    .then(() => resourceFilepath);
};
