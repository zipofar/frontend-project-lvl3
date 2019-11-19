import Toast from 'bootstrap/js/dist/toast';

export default (props, closeHandler) => {
  const {
    title,
    message,
    parentEl,
  } = props;

  const attributes = {
    role: 'alert',
    class: 'toast',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    'data-autohide': 'false',
  };
  const toastBody = `
    <div class="toast-header bg-danger">
      <strong class="mr-auto text-light">${title}</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  const toastEl = document.createElement('div');

  Object.keys(attributes).forEach((key) => { toastEl.setAttribute(key, attributes[key]); });
  toastEl.innerHTML = toastBody;
  parentEl.appendChild(toastEl);

  const btnCloseEl = toastEl.querySelector('button');
  btnCloseEl.onclick = () => {
    closeHandler();
    toastEl.remove();
  };

  const toast = new Toast(toastEl);
  toast.show();
};
