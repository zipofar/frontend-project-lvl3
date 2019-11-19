import axios from 'axios';
import rssParser from './rssParser';

const proxyAddress = 'https://api.codetabs.com/v1/proxy?quest=';
const startInterval = 2000;
const deltaInterval = 2000;

const getNewItemsFromFeed = (newItems, oldItems) => (
  newItems.filter(({ uid: uidInNew }) => (
    oldItems.filter(({ uid: uidInOld }) => (uidInNew === uidInOld)).length < 1
  ))
);

const intervalFetch = (state, currentFeed, interval) => {
  setTimeout(() => {
    const { url, uid } = currentFeed;
    const { failedFetchUidFeeds } = state;

    axios.get(`${proxyAddress}${url}`)
      .then(({ data }) => {
        if (failedFetchUidFeeds.includes(uid)) {
          state.failedFetchUidFeeds = failedFetchUidFeeds.filter((e) => (e !== uid));
        }
        const newFeed = rssParser(data);
        const newItems = getNewItemsFromFeed(newFeed.items, currentFeed.items);
        if (newItems.length > 0) {
          currentFeed.items = [...currentFeed.items, ...newItems];
        }

        intervalFetch(state, currentFeed, startInterval);
      })
      .catch(() => {
        const newInterval = interval + deltaInterval;
        console.log(`Error fetch feed ${currentFeed.url}, new interval = ${newInterval}`);
        if (!failedFetchUidFeeds.includes(uid)) {
          state.failedFetchUidFeeds = [...failedFetchUidFeeds, uid];
        }

        intervalFetch(state, currentFeed, newInterval);
      });
  }, interval);
};

export default (state, feedUid) => {
  const { feeds } = state;
  const currentFeed = feeds.filter(({ uid }) => (uid === feedUid))[0];
  intervalFetch(state, currentFeed, startInterval);
};
