#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .version('0.0.1')
  .description('Page loader utility.')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action(async (url) => {
    try {
      const pathToDownloadedResource = await pageLoader(url, program.opts().output);
      console.log(pathToDownloadedResource);
    } catch (e) {
      console.log(e.message);
    }
  });

program.parse();
