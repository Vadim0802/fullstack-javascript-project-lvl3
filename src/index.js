import axios from 'axios';
import fs from 'fs/promises';

const downloadResource = (url, dirpath) => axios.get(url)
  .then((res) => res.data)
  .then((data) => fs.writeFile(dirpath, data, 'utf-8'));

export default downloadResource;
