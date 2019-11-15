export default (xml) => {
  const rss = {
    title: null,
    description: null,
    items: [],
  };
  rss.title = xml.querySelector('title').textContent;
  rss.description = xml.querySelector('description').textContent;
  rss.items = [...xml.querySelectorAll('item')].map((e) => (
    {
      title: e.querySelector('title').textContent,
      link: e.querySelector('link').textContent,
    }
  ));
  return rss;
};
