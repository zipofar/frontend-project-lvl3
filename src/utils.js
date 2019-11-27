import sanitizeHtml from 'sanitize-html';

export const deepSanitize = (obj) => (
  Object.keys(obj).reduce((a, k) => {
    const value = obj[k];
    if (Array.isArray(value)) {
      return { ...a, [k]: value.map((e) => (deepSanitize(e))) };
    }
    return { ...a, [k]: sanitizeHtml(value) };
  }, {})
);

export default {
  deepSanitize,
};
