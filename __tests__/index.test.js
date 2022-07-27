import os from 'os';
import path from 'path';
import nock from 'nock';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
const noop = () => { };
const hostname = 'https://ru.hexlet.io';
const pathname = '/courses';

nock.disableNetConnect();

const assets = [
  '/assets/nodejs.png',
  '/assets/runtime.js',
  '/assets/application.css',
];
const before = await fs.readFile(getFixturePath('before.html'), 'utf-8');
nock(hostname).get(pathname).times(2).reply(200, before);

let expected;
beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('after.html'), 'utf-8');
});

let downloadDirectory;
beforeEach(async () => {
  await fs.rm(downloadDirectory, { recursive: true, force: true }).catch(noop);
  downloadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('pageLoader with existing page', async () => {
  assets.forEach(async (asset) => nock(hostname).get(asset).reply(200, await fs.readFile(getFixturePath(asset), 'utf-8')));

  const pathToDownloadedResource = await pageLoader('https://ru.hexlet.io/courses', downloadDirectory);
  const actual = await fs.readFile(pathToDownloadedResource, 'utf-8');
  expect(actual).toEqual(expected);
});
