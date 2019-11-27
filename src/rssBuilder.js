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

const setUidsToRssItems = (items) => (
  items.map((e) => (
    { ...e, uid: hash.sha1().update(e.link).digest('hex') }
  ))
);

export default (xmlStrRss) => {
  const parsedRss = parseRss(xmlStrRss);
  return { ...parsedRss, items: setUidsToRssItems(parsedRss.items) };
};
