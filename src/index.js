import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';
import prettier from 'prettier';
import * as cheerio from 'cheerio';
import { buildAssetFilenameFromUrl, buildFilenameFromUrl } from './utils.js';

const buildPromise = (link, assetFilepath) => {
  const { dir } = path.parse(assetFilepath);
  return fs.mkdir(dir, { recursive: true })
    .then(() => axios.get(link, { responseType: 'arraybuffer' }))
    .then(({ data: buffer }) => fs.writeFile(assetFilepath, buffer, 'binary'));
};

export default (link, dirpath) => {
  const urlInstance = new URL(link);
  const resourceFilename = buildFilenameFromUrl(link, '.html');
  const resourceFilepath = path.resolve(dirpath, resourceFilename);
  const assetsDirname = buildFilenameFromUrl(link, '_files');
  const assetsDirpath = path.resolve(dirpath, assetsDirname);

  return axios.get(link)
    .then(({ data }) => {
      const $ = cheerio.load(data);

      $('img, script[src], link[href]').each((_, node) => {
        const assetUrl = new URL(`${node.attribs.src || node.attribs.href}`, urlInstance.origin);

        if (!assetUrl.toString().startsWith(urlInstance.origin)) {
          return;
        }

        const assertFilepath = path.join(
          assetsDirpath,
          node.attribs.rel === 'canonical'
            ? buildFilenameFromUrl(assetUrl.toString(), '.html')
            : buildAssetFilenameFromUrl(assetUrl.toString()),
        );

        buildPromise(assetUrl.toString(), assertFilepath);
        const { base } = path.parse(assertFilepath);

        const attributeTypes = {
          img: 'src',
          script: 'src',
          link: 'href',
        };

        $(node).attr(attributeTypes[node.tagName], `${assetsDirname}/${base}`);
      });

      const prettifyHtml = prettier.format($.html(), { parser: 'html' });
      return fs.writeFile(resourceFilepath, prettifyHtml, 'utf-8');
    })
    .then(() => resourceFilepath);
};
