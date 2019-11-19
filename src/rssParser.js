import sanitizeHtml from 'sanitize-html';
import hash from 'hash.js';

export default (xmlStr) => {
  const domparser = new DOMParser();
  const xml = domparser.parseFromString(xmlStr, 'text/xml');
  const rss = {
    title: null,
    description: null,
    items: [],
  };

  rss.title = sanitizeHtml(xml.querySelector('title').textContent);
  rss.description = sanitizeHtml(xml.querySelector('description').textContent);
  rss.items = [...xml.querySelectorAll('item')]
    .map((e) => {
      const link = sanitizeHtml(e.querySelector('link').textContent);
      return (
        {
          link,
          uid: hash.sha1().update(link).digest('hex'),
          title: sanitizeHtml(e.querySelector('title').textContent),
          description: sanitizeHtml(e.querySelector('description').textContent),
        }
      );
    });
  return rss;
};
