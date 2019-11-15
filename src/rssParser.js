import sanitizeHtml from 'sanitize-html';

export default (xml) => {
  const rss = {
    title: null,
    description: null,
    items: [],
  };
  rss.title = sanitizeHtml(xml.querySelector('title').textContent);
  rss.description = sanitizeHtml(xml.querySelector('description').textContent);
  rss.items = [...xml.querySelectorAll('item')].map((e) => (
    {
      title: sanitizeHtml(e.querySelector('title').textContent),
      link: sanitizeHtml(e.querySelector('link').textContent),
    }
  ));
  return rss;
};
