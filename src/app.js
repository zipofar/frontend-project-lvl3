import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import hash from 'hash.js';
import feedBuilder from './feedBuilder';
import rssParser from './rssParser';

// const proxyAddress = 'https://crossorigin.me/';
const proxyAddress = 'https://api.codetabs.com/v1/proxy?quest=';

const issetFeed = (feeds, uid) => (
  feeds.filter((e) => (e.uid === uid)).length > 0
);

export default () => {
  const state = {
    ui: {
      stateForm: 'empty',
      stateFetchFeed: '',
      errorFetchFeed: '',
    },
    feeds: [],
  };
  const feedsContainer = document.getElementById('feeds');
  const formRss = document.getElementById('form-rss');
  const inputUrl = document.getElementById('input-url');
  const btnSubmit = document.getElementById('btn-add');

  formRss.addEventListener('submit', (e) => {
    e.preventDefault();
    state.ui.stateFetchFeed = '';
    state.ui.errorFetchFeed = '';
    state.ui.stateFetchFeed = 'request';

    const formData = new FormData(formRss);
    const rssUrl = formData.get('url');

    axios.get(`${proxyAddress}${rssUrl}`)
      .then(({ data }) => {
        const domparser = new DOMParser();
        const domXml = domparser.parseFromString(data, 'text/xml');
        const rssFeed = rssParser(domXml);
        const uid = hash.sha1().update(rssUrl).digest('hex');

        if (issetFeed(state.feeds, uid)) {
          state.ui.stateFetchFeed = 'failure';
          state.ui.errorFetchFeed = 'Feed isset';
          console.log(state.ui.errorFetchFeed);
          return;
        }

        rssFeed.uid = uid;
        state.feeds = [...state.feeds, rssFeed];
        state.ui.stateFetchFeed = 'success';
        state.ui.stateForm = 'empty';
      })
      .catch((error) => {
        state.ui.stateFetchFeed = 'failure';

        if (error.response) {
          const { status } = error.response;
          state.ui.errorFetchFeed = `Code ${status}`;
        } else {
          state.ui.errorFetchFeed = 'Something went wrong';
        }
      });
  });

  inputUrl.addEventListener('input', (e) => {
    const { value } = e.target;
    state.ui.stateForm = isUrl(value) ? 'valid' : 'invalid';
    state.ui.inputValue = value;
  });

  watch(state, 'ui', () => {
    if (state.ui.stateForm === 'invalid') {
      inputUrl.classList.add('is-invalid');
      btnSubmit.disabled = true;
    }

    if (state.ui.stateForm === 'empty') {
      btnSubmit.disabled = true;
    }

    if (state.ui.stateForm === 'valid') {
      inputUrl.classList.remove('is-invalid');
      btnSubmit.disabled = false;
    }

    if (state.ui.stateFetchFeed === 'request') {
      btnSubmit.disabled = true;
      inputUrl.disabled = true;
    }

    if (state.ui.stateFetchFeed === 'success') {
      inputUrl.value = '';
      inputUrl.disabled = false;
    }

    if (state.ui.stateFetchFeed === 'failure') {
      inputUrl.disabled = false;
    }
  });

  watch(state, 'feeds', () => {
    const { feeds } = state;
    const htmlFeeds = feeds.map((e) => feedBuilder(e)).join('');
    feedsContainer.innerHTML = htmlFeeds;
  });
};
