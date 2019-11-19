import axios from 'axios';
import rssParser from './rssParser';

const startInterval = 2000;
const deltaInterval = 2000;

const getNewItemsFromFeed = (newItems, oldItems) => (
  newItems.filter(({ uid: uidInNew }) => (
    oldItems.filter(({ uid: uidInOld }) => (uidInNew === uidInOld)).length < 1
  ))
);

const intervalFetch = (state, currentFeed, interval, proxyUrl) => {
  setTimeout(() => {
    const { url, uid } = currentFeed;
    const { failedFetchUidFeeds } = state;

    axios.get(`${proxyUrl}${url}`)
      .then(({ data }) => {
        const newFeed = rssParser(data);
        const newItems = getNewItemsFromFeed(newFeed.items, currentFeed.items);

        if (failedFetchUidFeeds.includes(uid)) {
          state.failedFetchUidFeeds = failedFetchUidFeeds.filter((e) => (e !== uid));
        }

        if (newItems.length > 0) {
          currentFeed.items = [...currentFeed.items, ...newItems];
        }

        intervalFetch(state, currentFeed, startInterval, proxyUrl);
      })
      .catch(() => {
        if (!failedFetchUidFeeds.includes(uid)) {
          state.failedFetchUidFeeds = [...failedFetchUidFeeds, uid];
        }

        const newInterval = interval + deltaInterval;
        intervalFetch(state, currentFeed, newInterval, proxyUrl);
      });
  }, interval);
};

export default (state, feedUid, opts) => {
  const { feeds } = state;
  const { proxyUrl } = opts;
  const currentFeed = feeds.filter(({ uid }) => (uid === feedUid))[0];
  intervalFetch(state, currentFeed, startInterval, proxyUrl);
};
