const itemsBuilder = (items) => {
  const list = items.map(({ title, link }) => (
    `
    <li>
      <a href='${link}'>
        ${title}
      </a>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm btn-feed-item-show-modal"
      >...</button>
    </li>
    `)).join('');
  return list.length > 0 ? `<ul>${list}</ul>` : '';
};

export default (feeds, feedsContainer, handlers) => {
  const { modalShow } = handlers;
  feedsContainer.innerHTML = '';
  feeds
    .forEach(({ title, description, items }) => {
      const feedBody = `
        <div class="col-sm-12">
          <div class="card">
            <div class="card-header">
              ${title}
            </div>
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>${description}</p>
                ${itemsBuilder(items, modalShow)}
              </blockquote>
            </div>
          </div>
        </div>
      `;

      const feedEl = document.createElement('div');
      feedEl.setAttribute('class', 'row');
      feedEl.innerHTML = feedBody;
      let i = 0;
      feedEl
        .querySelectorAll('.btn-feed-item-show-modal')
        .forEach((e) => {
          e.addEventListener('click', modalShow(items[i]));
          i += 1;
        });

      feedsContainer.appendChild(feedEl);
    });
};
