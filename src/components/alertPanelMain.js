const listFailedFeeds = (feeds) => {
  const list = feeds.map(({ title }) => (`<li>${title}</li>`));
  return list.length > 0 ? `<ul>${list.join('')}</ul>` : '';
};

export default (props) => {
  const {
    state,
    parentEl,
    failedFetchUidFeeds,
  } = props;

  const { feeds } = state;
  const failedFeeds = feeds.filter(({ uid }) => (failedFetchUidFeeds.includes(uid)));
  const alertBody = `
    <div class="alert alert-warning" id="alert-panel-main" role="alert">
      <p>Failed Feeds</p>
      ${listFailedFeeds(failedFeeds)}
    </div>
  `;

  const alertEl = document.createElement('div');
  alertEl.setAttribute('class', 'fixed-bottom');
  alertEl.innerHTML = alertBody;
  parentEl.innerHTML = '';
  parentEl.appendChild(alertEl);

  const timerId = setInterval(() => {
    if (state.failedFetchUidFeeds.length === 0) {
      clearInterval(timerId);
      parentEl.innerHTML = '';
    }
  }, 2000);
};
