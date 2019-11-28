const buildListFailedFeeds = (feeds) => {
  const list = feeds.map(({ title }) => (`<li>${title}</li>`));
  return list.length > 0 ? `<ul>${list.join('')}</ul>` : '';
};

export default (props) => {
  const { state, parentEl, content } = props;

  const { feeds } = state;
  const { failedUidsFeeds } = state.processAutoUpdateRssFeeds;
  const failedFeeds = feeds.filter(({ uid }) => (failedUidsFeeds.includes(uid)));
  const alertBody = `
    <div class="alert alert-warning" id="alert-panel-main" role="alert">
      <p>${content}</p>
      ${buildListFailedFeeds(failedFeeds)}
    </div>
  `;

  parentEl.innerHTML = '';
  const alertEl = document.createElement('div');
  alertEl.setAttribute('class', 'fixed-bottom');
  alertEl.innerHTML = alertBody;
  parentEl.appendChild(alertEl);

  const timerId = setInterval(() => {
    if (state.processAutoUpdateRssFeeds.failedUidsFeeds.length === 0) {
      clearInterval(timerId);
      parentEl.innerHTML = '';
    }
  }, 2000);
};
