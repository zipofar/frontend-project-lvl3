import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import hash from 'hash.js';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import rssFeeds from './components/rssFeeds';
import buildRss from './rssBuilder';
import Modal from './components/modal';
import startFeedAutoUpdater from './rssFeedUpdater';
import alert from './components/alertPanelMain';
import i18Config from './i18';

/* eslint no-param-reassign: 0 */

const config = {
  proxyUrl: 'https://api.codetabs.com/v1/proxy?quest=',
};
const hasFeed = (feeds, uid) => (feeds.filter((e) => (e.uid === uid)).length > 0);
const modalCloseHandler = (state) => () => {
  state.showDescriptionFeedItem.show = false;
};
const modalShowHandler = (state) => (data) => () => {
  state.showDescriptionFeedItem.show = true;
  state.showDescriptionFeedItem.data = data;
};

export default () => {
  i18next
    .use(LanguageDetector)
    .init(i18Config);

  const { proxyUrl } = config;
  const state = {
    additionProcess: {
      errors: [],
      state: 'filling', // filling, processed
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
    state.additionProcess.state = 'processed';
    state.additionProcess.errors = [];

    const formData = new FormData(formRssEl);
    const rssUrl = formData.get('url').trim();
    const feedUid = hash.sha1().update(rssUrl).digest('hex');

    if (hasFeed(state.feeds, feedUid)) {
      state.additionProcess.state = 'filling';
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
        state.additionProcess.state = 'filling';

        const rssFeed = buildRss(data);
        rssFeed.uid = feedUid;
        rssFeed.url = rssUrl;

        state.feeds = [...state.feeds, rssFeed];
        startFeedAutoUpdater(state, feedUid, { proxyUrl });
      })
      .catch((error) => {
        state.additionProcess.state = 'filling';
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
    state.additionProcess.state = 'filling';
    if (isUrl(value)) {
      state.additionProcess.validationState = 'valid';
    } else if (value === '') {
      state.additionProcess.validationState = 'none';
    } else {
      state.additionProcess.validationState = 'invalid';
    }
  });

  watch(state, 'additionProcess', (prop, action, newvalue, oldvalue) => {
    const {
      errors,
      validationState,
    } = state.additionProcess;

    if (prop === 'state' && newvalue === 'filling' && oldvalue === 'processed') {
      inputUrlEl.disabled = false;
      btnSubmitText.innerHTML = 'Add';
      btnSubmitSpinner.classList.add('d-none');
    } else if (prop === 'state' && newvalue === 'processed' && oldvalue === 'filling') {
      inputUrlEl.disabled = true;
      btnSubmitText.innerHTML = 'Loading...';
      btnSubmitSpinner.classList.remove('d-none');
      btnSubmitEl.disabled = true;

      if (errors.length === 0) {
        inputUrlEl.value = '';
        formRssFeedBackEl.classList.remove('invalid-feedback');
        formRssFeedBackEl.innerHTML = '';
      } else if (errors.length > 0) {
        formRssFeedBackEl.innerHTML = errors
          .map((e) => (i18next.t(e)))
          .join('; ');
        formRssFeedBackEl.classList.add('invalid-feedback');
      }
    }

    if (validationState === 'none') {
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
      alert({ state, parentEl: containerAlertPanelMain, content: i18next.t('Failed feeds') });
    }
  });
};
