#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../index.js';

const program = new Command();

program
  .version('0.0.1')
  .description('Page loader utility.')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir')
  .action((url) => {
    pageLoader(url, program.opts().output)
      .then((output) => console.log(`${url} was saved in ${output}`))
      .catch((err) => {
        console.error(err.message);
        process.exit(1);
      });
  });

program.parse();
