import * as cheerio from 'cheerio';

export const buildFilenameFromUrl = (link, prefix = '') => {
  const url = new URL(link);
  return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`
    .replace(/[^0-9a-zA-Z]/g, '-')
    .concat(prefix);
};

export const buildAssetFilenameFromUrl = (link) => {
  const url = new URL(link);
  const resource = `${url.origin}${url.pathname === '/' ? '' : url.pathname}`;
  const extension = resource.slice(link.lastIndexOf('.'));
  const formatted = buildFilenameFromUrl(resource);
  return formatted.slice(0, formatted.lastIndexOf('-')).concat(extension);
};

export const convertAssetUrls = (html, sourceUrl, assetsDirname) => {
  const $ = cheerio.load(html);

  const assetUrls = [];
  $('img, script[src], link[href]').each((_, node) => {
    const assetUrl = new URL(`${node.attribs.src || node.attribs.href}`, sourceUrl);

    if (!assetUrl.toString().startsWith(sourceUrl)) {
      return;
    }

    const assetFilename = node.attribs.rel === 'canonical'
      ? buildFilenameFromUrl(assetUrl.toString(), '.html')
      : buildAssetFilenameFromUrl(assetUrl.toString());

    const assetFilepath = `${assetsDirname}/${assetFilename}`;

    const mappingAttrs = {
      img: 'src',
      script: 'src',
      link: 'href',
    };

    assetUrls.push({ assetUrl: assetUrl.href, assetFilepath });
    $(node).attr(mappingAttrs[node.tagName], assetFilepath);
  });

  return { assetUrls, html: $.html() };
};
