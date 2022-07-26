import downloadResource from './src/index.js';

const pageLoader = async (url, output) => {
  const pathToDownloadedResource = downloadResource(url, output);

  return pathToDownloadedResource;
};

export default pageLoader;
