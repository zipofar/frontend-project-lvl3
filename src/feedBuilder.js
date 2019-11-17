const itemsBuilder = (items) => {
  const list = items.map((e) => (
    `
    <li>
      <a href='${e.link}'>
        ${e.title}
      </a>
      <button type="button" class="btn btn-outline-secondary btn-sm">...</button>
    </li>
    `)).join('');
  return list.length > 0 ? `<ul>${list}</ul>` : '';
};

export default (data) => {
  const feedHtml = `
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-header">
            ${data.title}
          </div>
          <div class="card-body">
            <blockquote class="blockquote mb-0">
              <p>${data.description}</p>
              ${itemsBuilder(data.items)}
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  `;

  return feedHtml;
};
