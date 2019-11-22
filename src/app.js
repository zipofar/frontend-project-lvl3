import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import hash from 'hash.js';
import rssFeeds from './components/rssFeeds';
import buildRss from './rssBuilder';
import Modal from './components/modal';
import startFeedAutoUpdater from './rssFeedUpdater';
import alert from './components/alertPanelMain';

const issetFeed = (feeds, uid) => (feeds.filter((e) => (e.uid === uid)).length > 0);
const modalCloseHandler = (state) => () => {
  /* eslint-disable-next-line */
  state.showDescriptionFeedItem.show = false;
};
const modalShowHandler = (state) => (data) => () => {
  /* eslint-disable-next-line */
  state.showDescriptionFeedItem.show = true;
  /* eslint-disable-next-line */
  state.showDescriptionFeedItem.data = data;
};

export default (config) => {
  const { proxyUrl } = config;
  const state = {
    additionProcess: {
      errors: [],
      stateProcess: 'filling', // filling, processed, finished
      validationState: 'none', // none, invalid, valid
    },
    showDescriptionFeedItem: {
      show: false,
      data: {},
    },
    feeds: [],
    processAutoUpdateRssFeeds: {
      failedUidsFeeds: [],
    },
    failedFetchUidFeeds: [],
  };
  const bodyEl = document.querySelector('body');
  const feedsContainerEl = document.getElementById('feeds');
  const formRssEl = document.getElementById('form-rss');
  const formRssFeedBackEl = document.getElementById('form-rss-feedback');
  const inputUrlEl = document.getElementById('input-url');
  const btnSubmitEl = document.getElementById('btn-add');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const btnSubmitSpinner = document.getElementById('btn-submit-spinner');
  const containerAlertPanelMain = document.getElementById('container-alert');

  formRssEl.addEventListener('submit', (e) => {
    e.preventDefault();
    state.additionProcess.stateProcess = 'processed';
    state.additionProcess.errors = [];

    const formData = new FormData(formRssEl);
    const rssUrl = formData.get('url').replace(/\/*$/, '');
    const feedUid = hash.sha1().update(rssUrl).digest('hex');

    if (issetFeed(state.feeds, feedUid)) {
      state.additionProcess.stateProcess = 'finished';
      state.additionProcess.validationState = 'invalid';
      state.additionProcess.errors = [
        ...state.additionProcess.errors,
        'Rss feed already exists',
      ];
      return;
    }

    axios.get(`${proxyUrl}${rssUrl}`)
      .then(({ data }) => {
        state.additionProcess.validationState = 'none';
        state.additionProcess.stateProcess = 'finished';

        const rssFeed = buildRss(data);
        rssFeed.uid = feedUid;
        rssFeed.url = rssUrl;

        state.feeds = [...state.feeds, rssFeed];
        startFeedAutoUpdater(state, feedUid, { proxyUrl });
      })
      .catch((error) => {
        state.additionProcess.stateProcess = 'finished';
        state.additionProcess.validationState = 'invalid';

        if (error.response) {
          const { status } = error.response;
          state.additionProcess.errors = [
            ...state.additionProcess.errors,
            `Response Code  ${status}`,
          ];
        } else {
          state.additionProcess.errors = [
            ...state.additionProcess.errors,
            'Something went wrong',
          ];
        }
      });
  });

  inputUrlEl.addEventListener('input', ({ target: { value } }) => {
    state.additionProcess.stateProcess = 'filling';
    if (isUrl(value)) {
      state.additionProcess.validationState = 'valid';
    } else if (value === '') {
      state.additionProcess.validationState = 'none';
    } else {
      state.additionProcess.validationState = 'invalid';
    }
  });

  watch(state, 'additionProcess', () => {
    const {
      errors,
      stateProcess,
      validationState,
    } = state.additionProcess;

    if (stateProcess === 'filling' || stateProcess === 'finished') {
      inputUrlEl.disabled = false;
      btnSubmitText.innerHTML = 'Add';
      btnSubmitSpinner.classList.add('d-none');
    } else if (stateProcess === 'processed') {
      inputUrlEl.disabled = true;
    }

    if (stateProcess === 'finished' && errors.length === 0) {
      inputUrlEl.value = '';
      formRssFeedBackEl.classList.remove('invalid-feedback');
      formRssFeedBackEl.innerHTML = '';
    } else if (stateProcess === 'finished' && errors.length > 0) {
      formRssFeedBackEl.innerHTML = errors.join('; ');
      formRssFeedBackEl.classList.add('invalid-feedback');
    }

    if (stateProcess === 'processed') {
      btnSubmitText.innerHTML = 'Loading...';
      btnSubmitSpinner.classList.remove('d-none');
      btnSubmitEl.disabled = true;
    } else if (validationState === 'none') {
      inputUrlEl.classList.remove('is-invalid');
      inputUrlEl.classList.remove('is-valid');
      btnSubmitEl.disabled = true;
    } else if (validationState === 'valid') {
      inputUrlEl.classList.remove('is-invalid');
      inputUrlEl.classList.add('is-valid');
      btnSubmitEl.disabled = false;
    } else if (validationState === 'invalid') {
      inputUrlEl.classList.add('is-invalid');
      inputUrlEl.classList.remove('is-valid');
      btnSubmitEl.disabled = true;
    }
  });

  watch(state, 'showDescriptionFeedItem', (prop, action, newvalue, oldvalue) => {
    const { data } = state.showDescriptionFeedItem;
    if (prop === 'show' && oldvalue === false && newvalue === true) {
      Modal({
        ...data,
        parentEl: bodyEl,
      },
      modalCloseHandler(state));
    }
  });

  watch(state, 'feeds', () => {
    const { feeds } = state;
    rssFeeds(feeds, feedsContainerEl, { modalShow: modalShowHandler(state) });
  });

  watch(state, 'processAutoUpdateRssFeeds', () => {
    const { failedUidsFeeds } = state.processAutoUpdateRssFeeds;
    if (failedUidsFeeds.length > 0) {
      alert({ state, parentEl: containerAlertPanelMain });
    }
  });
};
