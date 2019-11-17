import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import hash from 'hash.js';
import feedBuilder from './feedBuilder';
import rssParser from './rssParser';
import Toast from './toast';

// const proxyAddress = 'https://crossorigin.me/';
const proxyAddress = 'https://api.codetabs.com/v1/proxy?quest=';

const issetFeed = (feeds, uid) => (
  feeds.filter((e) => (e.uid === uid)).length > 0
);

const btnSubmitElIsDisabled = ({ ui }) => {
  if (ui.stateRssForm === 'invalid'
    || ui.stateRssForm === 'empty'
    || ui.stateFetchFeed === 'request') {
    return true;
  }

  return false;
};

const inputUrlElIsDisabled = ({ ui }) => (ui.stateFetchFeed === 'request');
const inputUrlElIsValid = ({ ui }) => (
  ui.stateRssForm === 'valid' || ui.stateRssForm === 'empty'
);

export default () => {
  const state = {
    ui: {
      stateRssForm: 'empty',
      stateFetchFeed: '',
      errorRssForm: '',
      currentValueRssUrl: '',
      showToast: false,
    },
    feeds: [],
  };
  const toastContainerEl = document.getElementById('toast-container');
  const feedsContainerEl = document.getElementById('feeds');
  const formRssEl = document.getElementById('form-rss');
  const inputUrlEl = document.getElementById('input-url');
  const btnSubmitEl = document.getElementById('btn-add');

  formRssEl.addEventListener('submit', (e) => {
    e.preventDefault();
    state.ui.stateFetchFeed = '';
    state.ui.errorRssForm = '';
    state.ui.stateFetchFeed = 'request';
    state.ui.showToast = false;

    const rssUrl = state.ui.currentValueRssUrl.replace(/\/*$/, '');

    axios.get(`${proxyAddress}${rssUrl}`)
      .then(({ data }) => {
        state.ui.stateFetchFeed = 'success';
        state.ui.stateRssForm = 'empty';
        state.ui.currentValueRssUrl = '';

        const domparser = new DOMParser();
        const domXml = domparser.parseFromString(data, 'text/xml');
        const rssFeed = rssParser(domXml);
        const uid = hash.sha1().update(rssUrl).digest('hex');

        if (issetFeed(state.feeds, uid)) {
          state.ui.errorRssForm = 'Feed isset';
          state.ui.showToast = true;
          console.log(state.ui.errorRssForm);
          return;
        }

        rssFeed.uid = uid;
        state.feeds = [...state.feeds, rssFeed];
      })
      .catch((error) => {
        state.ui.stateFetchFeed = 'failure';

        if (error.response) {
          const { status } = error.response;
          state.ui.errorRssForm = `Code ${status}`;
          state.ui.showToast = true;
        } else {
          state.ui.errorRssForm = 'Something went wrong';
          state.ui.showToast = true;
        }
      });
  });

  inputUrlEl.addEventListener('input', ({ target: { value } }) => {
    state.ui.currentValueRssUrl = value;
    state.ui.stateRssForm = isUrl(value) ? 'valid' : 'invalid';
  });


  watch(state, 'ui', (prop, action, newvalue, oldvalue) => {
    btnSubmitEl.disabled = btnSubmitElIsDisabled(state);
    inputUrlEl.disabled = inputUrlElIsDisabled(state);
    inputUrlEl.classList.toggle('is-invalid', !inputUrlElIsValid(state));

    if (prop === 'showToast' && oldvalue === false && newvalue === true) {
      Toast({
        title: 'Error',
        message: state.ui.errorRssForm,
        parentEl: toastContainerEl,
        state,
      });
    }
  });

  watch(state, 'feeds', () => {
    const { feeds } = state;
    const htmlFeeds = feeds.map((e) => feedBuilder(e)).join('');
    feedsContainerEl.innerHTML = htmlFeeds;
    inputUrlEl.value = state.ui.currentValueRssUrl;
  });
};
