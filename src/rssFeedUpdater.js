import axios from 'axios';
import rssParser from './rssParser';

const proxyAddress = 'https://api.codetabs.com/v1/proxy?quest=';
const startInterval = 2000;
const deltaInterval = 2000;

const getNewItemsFromFeed = (newItems, oldItems) => {
  return newItems.filter(({ uid: uidInNew }) => {
    return oldItems.filter(({ uid: uidInOld }) => (uidInNew === uidInOld)).length < 1;
  });
};

const intervalFetch = (state, currentFeed, interval) => {
  setTimeout(() => {
    const { url, uid } = currentFeed;
    const { uiIntervalProcess } = state;

    axios.get(`${proxyAddress}${url}`)
      .then(({ data }) => {
        uiIntervalProcess.stateFetchFeeds = { ...uiIntervalProcess.stateFetchFeeds, [uid]: 'success' };

        const domparser = new DOMParser();
        const domXml = domparser.parseFromString(data, 'text/xml');
        const newFeed = rssParser(domXml);
        const newItems = getNewItemsFromFeed(newFeed.items, currentFeed.items);
        if (newItems.length > 0) {
          currentFeed.items = [...currentFeed.items, ...newItems];
        }
        intervalFetch(state, currentFeed, startInterval);
      })
      .catch(() => {
        const newInterval = interval + deltaInterval;
        console.log(`Error fetch feed ${currentFeed.url}, new interval = ${newInterval}`);
        intervalFetch(state, currentFeed, newInterval);
        uiIntervalProcess.stateFetchFeeds = { ...uiIntervalProcess.stateFetchFeeds, [uid]: 'failure' };
      });
  }, interval);
};

export default (state, feedUid) => {
  const { feeds } = state;
  const currentFeed = feeds.filter(({ uid }) => (uid === feedUid))[0];
  intervalFetch(state, currentFeed, startInterval);
};
