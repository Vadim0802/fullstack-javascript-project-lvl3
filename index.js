import path from 'path';
import { buildResourceFilename } from './src/utils.js';
import downloadResource from './src/index.js';

const pageLoader = async (url, dirpath) => {
  const resourceFilename = buildResourceFilename(url);
  const pathToDownloadedResource = path.resolve(dirpath, resourceFilename);
  await downloadResource(url, pathToDownloadedResource);

  return pathToDownloadedResource;
};

export default pageLoader;
