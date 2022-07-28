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
const link = `${hostname}${pathname}`;

nock.disableNetConnect();

const assets = [
  '/assets/nodejs.png',
  '/assets/runtime.js',
  '/assets/application.css',
];
const scope = nock(hostname);

let before;
let expected;
beforeAll(async () => {
  before = await fs.readFile(getFixturePath('before.html'), 'utf-8');
  expected = await fs.readFile(getFixturePath('after.html'), 'utf-8');
});

let downloadDirectory;
let noAccessDownloadDirectory;
beforeEach(async () => {
  await fs.rm(downloadDirectory, { recursive: true, force: true }).catch(noop);
  downloadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  noAccessDownloadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-no-access'));
  await fs.chmod(noAccessDownloadDirectory, 0o000);
  scope.get(pathname).times(2).reply(200, before);
});

test('page-loader with existing page', async () => {
  assets.forEach((asset) => {
    scope
      .get(asset)
      .reply(200, fs.readFile(getFixturePath(asset), 'utf-8'));
  });

  const pathToDownloadedResource = await pageLoader(link, downloadDirectory);
  const actual = await fs.readFile(pathToDownloadedResource, 'utf-8');
  expect(actual).toEqual(expected);
});

test('page-loader should load page with list error', async () => {
  assets.forEach((asset) => {
    scope
      .get(asset)
      .reply(404);
  });
  await expect(async () => {
    const pathToDownloadedResource = await pageLoader(link, downloadDirectory);
    const actual = await fs.readFile(pathToDownloadedResource, 'utf-8');
    expect(actual).toEqual(expected);
  }).rejects.toThrow('Something went wrong');
});

test('page-loader should fail and show ENOENT error', async () => {
  await expect(pageLoader(link, '/wrong/path')).rejects.toThrow('ENOENT');
});

test('page-loader should fail and show EACCES error', async () => {
  await expect(pageLoader(link, noAccessDownloadDirectory)).rejects.toThrow('EACCES');
});

test('page-loader should fail with invalid url', async () => {
  const errorUrl = `${link}/error`;
  const urlPath = '/courses/error';
  scope
    .get(urlPath)
    .reply(404, []);

  await expect(pageLoader(errorUrl, downloadDirectory)).rejects.toThrow('404');
});
