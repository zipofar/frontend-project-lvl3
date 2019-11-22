import sanitizeHtml from 'sanitize-html';
import hash from 'hash.js';

export const parseRss = (xmlStr) => {
  const domparser = new DOMParser();
  const xml = domparser.parseFromString(xmlStr, 'text/xml');
  const rss = {
    title: null,
    description: null,
    items: [],
  };

  rss.title = xml.querySelector('title').textContent;
  rss.description = xml.querySelector('description').textContent;
  rss.items = [...xml.querySelectorAll('item')]
    .map((e) => (
      {
        link: e.querySelector('link').textContent,
        title: e.querySelector('title').textContent,
        description: e.querySelector('description').textContent,
      }
    ));
  return rss;
};

export const deepSanitize = (obj) => (
  Object.keys(obj).reduce((a, k) => {
    const value = obj[k];
    if (Array.isArray(value)) {
      return { ...a, [k]: value.map((e) => (deepSanitize(e))) };
    }
    return { ...a, [k]: sanitizeHtml(value) };
  }, {})
);

const setUidsToRssItems = (items) => (
  items.map((e) => (
    { ...e, uid: hash.sha1().update(e.link).digest('hex') }
  ))
);

export default (xmlStrRss) => {
  const parsedRss = parseRss(xmlStrRss);
  const sanitizedRss = deepSanitize(parsedRss);
  return { ...sanitizedRss, items: setUidsToRssItems(sanitizedRss.items) };
};
