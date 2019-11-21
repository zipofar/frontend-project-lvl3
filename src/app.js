import axios from 'axios';
import isUrl from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import hash from 'hash.js';
import rssFeeds from './components/rssFeeds';
import rssParser from './rssParser';
import Toast from './components/toast';
import Modal from './components/modal';
import startFeedAutoUpdater from './rssFeedUpdater';
import alert from './components/alertPanelMain';

const issetFeed = (feeds, uid) => (feeds.filter((e) => (e.uid === uid)).length > 0);
const toastBtnCloseHandler = (state) => () => { state.ui.showToast = false; };
const modalCloseHandler = (state) => () => { state.ui.showModal = false; };
const modalShowHandler = (state) => (data) => () => {
  state.ui.showModal = true;
  state.ui.dataModal = data;
};

const inputUrlElIsValid = ({ ui }) => (
  ui.stateRssForm === 'valid' || ui.stateRssForm === 'empty'
);

export default (config) => {
  const { proxyUrl } = config;
  const state = {
    ui: {
      stateRssForm: 'empty',
      stateFetchFeed: '',
      stateSubmitBtn: 'disabled',
      stateInputUrl: 'enabled',
      errorRssForm: '',
      currentValueRssUrl: '',
      showToast: false,
      showModal: false,
      dataModal: {},
    },
    feeds: [],
    failedFetchUidFeeds: [],
  };
  const bodyEl = document.querySelector('body');
  const toastContainerEl = document.getElementById('toast-container');
  const feedsContainerEl = document.getElementById('feeds');
  const formRssEl = document.getElementById('form-rss');
  const inputUrlEl = document.getElementById('input-url');
  const btnSubmitEl = document.getElementById('btn-add');
  const containerAlertPanelMain = document.getElementById('container-alert');

  formRssEl.addEventListener('submit', (e) => {
    e.preventDefault();
    state.ui.stateFetchFeed = '';
    state.ui.stateSubmitBtn = 'disabled';
    state.ui.stateInputUrl = 'disabled';
    state.ui.errorRssForm = '';
    state.ui.stateFetchFeed = 'request';
    state.ui.showToast = false;

    const rssUrl = state.ui.currentValueRssUrl.replace(/\/*$/, '');
    const feedUid = hash.sha1().update(rssUrl).digest('hex');

    if (issetFeed(state.feeds, feedUid)) {
      state.ui.errorRssForm = 'Feed isset';
      state.ui.stateFetchFeed = 'success';
      state.ui.stateSubmitBtn = 'enabled';
      state.ui.stateInputUrl = 'enabled';
      state.ui.showToast = true;
      console.log(state.ui.errorRssForm);
      return;
    }

    axios.get(`${proxyUrl}${rssUrl}`)
      .then(({ data }) => {
        state.ui.stateFetchFeed = 'success';
        state.ui.stateRssForm = 'empty';
        state.ui.currentValueRssUrl = '';
        state.ui.stateSubmitBtn = 'disabled';
        state.ui.stateInputUrl = 'enabled';

        const rssFeed = rssParser(data);
        rssFeed.uid = feedUid;
        rssFeed.url = rssUrl;

        state.feeds = [...state.feeds, rssFeed];
        startFeedAutoUpdater(state, feedUid, { proxyUrl });
      })
      .catch((error) => {
        state.ui.stateFetchFeed = 'failure';
        state.ui.stateSubmitBtn = 'enabled';
        state.ui.stateInputUrl = 'enabled';

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
    const isValidUrl = isUrl(value);
    state.ui.currentValueRssUrl = value;
    state.ui.stateRssForm = isValidUrl ? 'valid' : 'invalid';

    if (!isValidUrl || value === '') {
      state.ui.stateSubmitBtn = 'disabled';
    } else {
      state.ui.stateSubmitBtn = 'enabled';
    }
  });

  watch(state, 'ui', (prop, action, newvalue, oldvalue) => {
    const {
      stateSubmitBtn,
      stateInputUrl,
      dataModal,
      errorRssForm,
    } = state.ui;

    btnSubmitEl.disabled = stateSubmitBtn === 'disabled';
    inputUrlEl.disabled = stateInputUrl === 'disabled';
    inputUrlEl.classList.toggle('is-invalid', !inputUrlElIsValid(state));

    if (prop === 'showToast' && oldvalue === false && newvalue === true) {
      Toast({
        title: 'Error',
        message: errorRssForm,
        parentEl: toastContainerEl,
      },
      toastBtnCloseHandler(state));
    }

    if (prop === 'showModal' && oldvalue === false && newvalue === true) {
      Modal({
        ...dataModal,
        parentEl: bodyEl,
      },
      modalCloseHandler(state));
    }
  });

  watch(state, 'feeds', () => {
    const { feeds } = state;
    rssFeeds(feeds, feedsContainerEl, { modalShow: modalShowHandler(state) });
    inputUrlEl.value = state.ui.currentValueRssUrl;
  });

  watch(state, 'failedFetchUidFeeds', () => {
    const { failedFetchUidFeeds } = state;
    if (failedFetchUidFeeds.length > 0) {
      alert({ state, failedFetchUidFeeds, parentEl: containerAlertPanelMain });
    }
  });
};
