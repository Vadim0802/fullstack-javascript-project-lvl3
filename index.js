import pageLoader from './src/index.js';

export default (link, output = process.cwd()) => pageLoader(link, output);
