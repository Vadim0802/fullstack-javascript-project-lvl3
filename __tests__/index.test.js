import os from 'os';
import path from 'path';
import nock from 'nock';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import pageLoader from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
const noop = () => { };

nock.disableNetConnect();

let expected;
beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('fixture.html'), 'utf-8');
});

let downloadDirectory;
beforeEach(async () => {
  await fs.rm(downloadDirectory, { recursive: true, force: true }).catch(noop);
  downloadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('pageLoader with existing page', async () => {
  nock('https://localhost')
    .get('/page')
    .reply(200, expected);

  const pathToDownloadedResource = await pageLoader('https://localhost/page', downloadDirectory);
  const actual = await fs.readFile(pathToDownloadedResource, 'utf-8');
  expect(actual).toEqual(expected);
});
